import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
export const securityHeaders = [
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enable XSS filtering
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Enable HSTS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Feature Policy (now Permissions Policy in newer browsers)
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

// Generate a secure CSP header
export function generateCSP(nonce: string): string {
  // In production, use strict CSP with nonce
  if (process.env.NODE_ENV === 'production') {
    return [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
      `img-src 'self' data: blob: https:`,
      `font-src 'self'`,
      `connect-src 'self' https://api.example.com`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
    ].join('; ');
  }
  
  // In development, use a more permissive CSP
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self'`,
    `connect-src 'self' http://localhost:3000`,
    `frame-src 'self'`,
  ].join('; ');
}

// Apply security headers to a Next.js response
export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Set security headers
  securityHeaders.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  
  // Set CSP header
  response.headers.set('Content-Security-Policy', generateCSP(nonce));
  
  // Set nonce for inline scripts
  response.headers.set('x-nonce', nonce);
  
  // Security-related headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  return response;
}

// Middleware to add security headers
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const response = await handler(request);
    return applySecurityHeaders(request, response);
  };
}
