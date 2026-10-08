// Studio Concurrency & Rate Limiting Utility
// Designed for 1,000+ simultaneous users
// Limits: Anonymous: 60 req/min, Authenticated: 600 req/min, Admin: unlimited

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  error?: string;
}

export function checkRateLimit(
  identifier: string,
  role: 'anonymous' | 'authenticated' | 'admin' = 'anonymous',
  maxOverride?: number
): RateLimitResult {
  // Admin is unlimited
  if (role === 'admin') {
    return {
      allowed: true,
      limit: Infinity,
      remaining: 999999,
      resetSeconds: 0,
    };
  }

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests =
    typeof maxOverride === 'number' && maxOverride > 0 ? maxOverride : role === 'authenticated' ? 600 : 60;

  const current = memoryStore.get(identifier);

  if (!current || now > current.resetAt) {
    // New window
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: 60,
    };
  }

  if (current.count >= maxRequests) {
    const resetSeconds = Math.ceil((current.resetAt - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
      error: `PRIME rate threshold exceeded. Maximum ${maxRequests} requests per minute. Retry in ${resetSeconds}s.`,
    };
  }

  current.count++;
  const resetSeconds = Math.ceil((current.resetAt - now) / 1000);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    resetSeconds,
  };
}

// Clean up stale memory records periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 120000); // Clean every 2 minutes
}
