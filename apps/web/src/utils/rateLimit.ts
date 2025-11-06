/**
 * Rate Limiting Utilities
 * In-memory rate limiting for development
 * For production, consider using Redis or Upstash
 */

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory storage for rate limits
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number }
>()

/**
 * Rate limit a request by identifier (IP, wallet address, etc.)
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 requests per minute
  }
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  // Get or create rate limit entry
  const existing = rateLimitStore.get(key)

  if (existing) {
    // Check if window has expired
    if (now > existing.resetTime) {
      // Reset the counter
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.interval,
      })

      return {
        success: true,
        limit: config.uniqueTokenPerInterval,
        remaining: config.uniqueTokenPerInterval - 1,
        reset: now + config.interval,
      }
    }

    // Window hasn't expired, check count
    if (existing.count >= config.uniqueTokenPerInterval) {
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset: existing.resetTime,
      }
    }

    // Increment count
    existing.count++
    rateLimitStore.set(key, existing)

    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - existing.count,
      reset: existing.resetTime,
    }
  }

  // First request
  rateLimitStore.set(key, {
    count: 1,
    resetTime: now + config.interval,
  })

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - 1,
    reset: now + config.interval,
  }
}

/**
 * Rate limit by wallet address
 */
export async function rateLimitWallet(
  walletAddress: string,
  action: 'purchase' | 'create' | 'list' | 'connect' = 'purchase'
): Promise<RateLimitResult> {
  const configs = {
    purchase: { interval: 60 * 1000, uniqueTokenPerInterval: 5 }, // 5 purchases per minute
    create: { interval: 5 * 60 * 1000, uniqueTokenPerInterval: 10 }, // 10 creates per 5 minutes
    list: { interval: 60 * 1000, uniqueTokenPerInterval: 20 }, // 20 listings per minute
    connect: { interval: 60 * 1000, uniqueTokenPerInterval: 3 }, // 3 connections per minute
  }

  return rateLimit(`wallet:${action}:${walletAddress}`, configs[action])
}

/**
 * Rate limit by IP address
 */
export async function rateLimitIP(
  ipAddress: string,
  path: string
): Promise<RateLimitResult> {
  // More lenient for browsing, strict for actions
  const config = path.includes('/api/')
    ? { interval: 60 * 1000, uniqueTokenPerInterval: 30 } // 30 API requests per minute
    : { interval: 60 * 1000, uniqueTokenPerInterval: 100 } // 100 page loads per minute

  return rateLimit(`ip:${ipAddress}:${path}`, config)
}

/**
 * Progressive delay based on attempts
 * Implements exponential backoff
 */
export function getProgressiveDelay(attempts: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 60000 // 1 minute
  const delay = Math.min(baseDelay * Math.pow(2, attempts), maxDelay)
  return delay
}

/**
 * Check if action should be delayed
 */
export async function shouldDelay(
  identifier: string
): Promise<{ delay: boolean; waitTime: number }> {
  const key = `delay:${identifier}`
  const existing = rateLimitStore.get(key)

  if (!existing) {
    return { delay: false, waitTime: 0 }
  }

  const now = Date.now()
  const waitTime = existing.resetTime - now

  if (waitTime > 0) {
    return { delay: true, waitTime }
  }

  // Delay expired, remove from store
  rateLimitStore.delete(key)
  return { delay: false, waitTime: 0 }
}

/**
 * Apply progressive delay to identifier
 */
export function applyProgressiveDelay(identifier: string, attempts: number): void {
  const delay = getProgressiveDelay(attempts)
  rateLimitStore.set(`delay:${identifier}`, {
    count: attempts,
    resetTime: Date.now() + delay,
  })
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  // Only run on server
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}

/**
 * Get client IP from headers
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  )
}

/**
 * Check for suspicious patterns
 */
export function detectSuspiciousPattern(data: {
  requestsPerMinute?: number
  failedAttempts?: number
  rapidClicks?: boolean
  unusualTiming?: boolean
}): { suspicious: boolean; reason?: string } {
  // Too many requests
  if (data.requestsPerMinute && data.requestsPerMinute > 60) {
    return { suspicious: true, reason: 'Too many requests per minute' }
  }

  // Too many failed attempts
  if (data.failedAttempts && data.failedAttempts > 5) {
    return { suspicious: true, reason: 'Too many failed attempts' }
  }

  // Rapid clicking (inhuman speed)
  if (data.rapidClicks) {
    return { suspicious: true, reason: 'Rapid clicking detected' }
  }

  // Unusual timing patterns
  if (data.unusualTiming) {
    return { suspicious: true, reason: 'Unusual timing pattern' }
  }

  return { suspicious: false }
}
