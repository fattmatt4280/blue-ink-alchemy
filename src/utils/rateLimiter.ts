interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000 }
): { allowed: boolean; remainingAttempts: number; resetAt: number } => {
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
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetAt
    };
  }

  if (currentRecord.count >= config.maxAttempts) {
    // Rate limit exceeded
    return {
      allowed: false,
      remainingAttempts: 0,
      resetAt: currentRecord.resetAt
    };
  }

  // Increment count
  currentRecord.count++;
  rateLimitStore.set(key, currentRecord);

  return {
    allowed: true,
    remainingAttempts: config.maxAttempts - currentRecord.count,
    resetAt: currentRecord.resetAt
  };
};

export const getRateLimitKey = (identifier: string, action: string): string => {
  return `${action}:${identifier}`;
};
