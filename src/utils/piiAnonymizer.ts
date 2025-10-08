/**
 * PII Anonymization Utility
 * Detects and scrubs Personally Identifiable Information from data
 */

export interface AnonymizationResult {
  anonymized: any;
  piiDetected: string[];
}

const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};

/**
 * Mask email address
 * user@example.com -> u***@example.com
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  const maskedLocal = local.length > 2 
    ? local[0] + '***' 
    : '***';
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number
 * +1 (555) 123-4567 -> +1 (***) ***-4567
 */
export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3');
};

/**
 * Mask IP address
 * 192.168.1.100 -> 192.168.***.***
 */
export const maskIP = (ip: string): string => {
  const parts = ip.split('.');
  if (parts.length !== 4) return ip;
  return `${parts[0]}.${parts[1]}.***.***`;
};

/**
 * Hash sensitive data using SHA-256
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Detect PII in text
 */
export const detectPII = (text: string): string[] => {
  const detected: string[] = [];
  
  if (PII_PATTERNS.email.test(text)) detected.push('email');
  if (PII_PATTERNS.phone.test(text)) detected.push('phone');
  if (PII_PATTERNS.ssn.test(text)) detected.push('ssn');
  if (PII_PATTERNS.creditCard.test(text)) detected.push('creditCard');
  if (PII_PATTERNS.ipv4.test(text)) detected.push('ip');
  
  return detected;
};

/**
 * Scrub PII from text
 */
export const scrubText = (text: string): string => {
  let scrubbed = text;
  
  scrubbed = scrubbed.replace(PII_PATTERNS.email, '[EMAIL REDACTED]');
  scrubbed = scrubbed.replace(PII_PATTERNS.phone, '[PHONE REDACTED]');
  scrubbed = scrubbed.replace(PII_PATTERNS.ssn, '[SSN REDACTED]');
  scrubbed = scrubbed.replace(PII_PATTERNS.creditCard, '[CARD REDACTED]');
  scrubbed = scrubbed.replace(PII_PATTERNS.ipv4, '[IP REDACTED]');
  
  return scrubbed;
};

/**
 * Anonymize analytics event data
 */
export const anonymizeEventData = (eventData: any): AnonymizationResult => {
  const piiDetected: string[] = [];
  const anonymized = JSON.parse(JSON.stringify(eventData));
  
  // Remove or mask common PII fields
  const piiFields = ['email', 'phone', 'name', 'firstName', 'lastName', 'address'];
  
  const processObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const detected = detectPII(obj[key]);
        if (detected.length > 0) {
          piiDetected.push(...detected);
          obj[key] = scrubText(obj[key]);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObject(obj[key]);
      }
      
      // Remove known PII fields
      if (piiFields.includes(key.toLowerCase())) {
        delete obj[key];
        piiDetected.push(key);
      }
    }
  };
  
  processObject(anonymized);
  
  return {
    anonymized,
    piiDetected: [...new Set(piiDetected)]
  };
};

/**
 * Truncate user agent to browser/OS only
 */
export const anonymizeUserAgent = (userAgent: string): string => {
  // Extract browser and OS, remove version details
  const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/);
  const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/);
  
  const browser = browserMatch ? browserMatch[1] : 'Unknown';
  const os = osMatch ? osMatch[1] : 'Unknown';
  
  return `${browser}/${os}`;
};

/**
 * Remove query parameters from URLs
 */
export const anonymizeURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url.split('?')[0];
  }
};
