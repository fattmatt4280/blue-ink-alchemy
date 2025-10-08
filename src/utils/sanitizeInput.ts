/**
 * Input sanitization utilities for security
 */

/**
 * Removes HTML tags and potentially dangerous characters from text input
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

/**
 * Validates and sanitizes email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Basic sanitization - remove whitespace and convert to lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Check for basic email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Validates URL to prevent javascript: and data: URIs
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  const sanitized = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = sanitized.toLowerCase();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      throw new Error('Invalid URL protocol');
    }
  }
  
  // Ensure it starts with http:// or https://
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }
  
  return sanitized;
};

/**
 * Enforces maximum length with truncation
 */
export const enforceMaxLength = (input: string, maxLength: number): string => {
  if (!input) return '';
  return input.slice(0, maxLength);
};

/**
 * Sanitizes object by applying sanitization to all string values
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
