import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitIP, getClientIP } from './utils/rateLimit'

/**
 * Next.js Middleware for Rate Limiting and Security
 * Runs on Edge Runtime for optimal performance
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request.headers)

  // Skip rate limiting for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting based on IP and path
  const rateLimitResult = await rateLimitIP(clientIP, pathname)

  if (!rateLimitResult.success) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please slow down and try again later',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    )
  }

  // Add rate limit headers to response
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // CSP header (adjust based on your needs)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src https://hcaptcha.com https://*.hcaptcha.com;"
  )

  return response
}

/**
 * Configure which routes should use this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
