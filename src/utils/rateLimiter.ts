interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
  violations: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000 }
): { allowed: boolean; remainingAttempts: number; resetAt: number; violations: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired records
  if (record && now > record.resetAt) {
    rateLimitStore.delete(key);
  }

  const currentRecord = rateLimitStore.get(key);

  if (!currentRecord) {
    // First attempt
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt, violations: 0 });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetAt,
      violations: 0
    };
  }

  if (currentRecord.count >= config.maxAttempts) {
    // Rate limit exceeded - increment violations
    currentRecord.violations++;
    
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: currentRecord.resetAt,
      violations: currentRecord.violations
    };
  }

  // Increment count
  currentRecord.count++;
  rateLimitStore.set(key, currentRecord);

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - currentRecord.count,
    resetAt: currentRecord.resetAt,
    violations: currentRecord.violations
  };
};

export const getRateLimitKey = (identifier: string, action: string): string => {
  return `${action}:${identifier}`;
};

/**
 * Get violation count for monitoring
 */
export const getViolationCount = (key: string): number => {
  const record = rateLimitStore.get(key);
  return record?.violations || 0;
};
