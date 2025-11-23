import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

// In a production app, use a secure session store like Redis
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate a secure random token
generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Middleware function
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Skip CSRF for public assets and API routes that don't need it
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.endsWith('.ico') ||
    request.nextUrl.pathname.endsWith('.png') ||
    request.nextUrl.pathname.endsWith('.jpg') ||
    request.nextUrl.pathname.endsWith('.jpeg') ||
    request.nextUrl.pathname.endsWith('.svg') ||
    request.nextUrl.pathname.endsWith('.css') ||
    request.nextUrl.pathname.endsWith('.js')
  ) {
    return response;
  }

  // Get or create session ID
  let sessionId = request.cookies.get('session_id')?.value;
  if (!sessionId) {
    sessionId = randomBytes(16).toString('hex');
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }

  // Handle CSRF token for non-GET requests
  if (request.method !== 'GET') {
    const csrfToken = request.headers.get('x-csrf-token') || request.nextUrl.searchParams.get('_csrf');
    
    if (!csrfToken) {
      return new NextResponse('CSRF token is missing', { status: 403 });
    }

    const sessionData = sessionId ? csrfTokens.get(sessionId) : null;
    
    if (!sessionData || sessionData.token !== csrfToken) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }

    // Token is valid, remove it so it can't be used again
    if (sessionId) {
      csrfTokens.delete(sessionId);
    }
  }

  // Generate new CSRF token for the response
  if (sessionId) {
    const newToken = generateCsrfToken();
    csrfTokens.set(sessionId, {
      token: newToken,
      expires: Date.now() + 3600000, // 1 hour expiration
    });
    
    // Add CSRF token to response headers
    response.headers.set('x-csrf-token', newToken);
  }

  // Clean up expired tokens
  const now = Date.now();
  for (const [id, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(id);
    }
  }

  return response;
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
