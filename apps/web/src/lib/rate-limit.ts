/**
 * Rate limiting utilities
 * Uses in-memory store for simplicity
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check rate limit for a key (e.g., wallet address or IP)
 *
 * @param key - Identifier (wallet address or IP)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Clean up expired records periodically
  if (Math.random() < 0.01) {
    cleanupExpiredRecords(now)
  }

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs
    }
  }

  // Increment count
  record.count++

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: record.resetTime
  }
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpiredRecords(now: number) {
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString()
  }
}
