/**
 * Example API Route using the new API handler
 *
 * This demonstrates how to use the centralized error handling:
 *
 * BEFORE (old way with repetitive try-catch):
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   try {
 *     const data = await fetchData();
 *     return NextResponse.json({ success: true, data });
 *   } catch (error) {
 *     console.error(error);
 *     return NextResponse.json({ error: 'Failed' }, { status: 500 });
 *   }
 * }
 * ```
 *
 * AFTER (new way with apiHandler):
 * ```typescript
 * export const GET = apiHandler(async (req) => {
 *   const data = await fetchData();
 *   return data; // Errors are automatically caught and formatted
 * });
 * ```
 */

import { NextRequest } from 'next/server';
import { apiHandler, ApiError } from '@/lib/api';

// Example GET endpoint
export const GET = apiHandler(async (req: NextRequest) => {
  // Business logic here - errors are automatically handled
  const data = {
    message: 'This is an example API route',
    timestamp: new Date().toISOString(),
  };

  return data;
});

// Example POST endpoint with validation
export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Throw ApiError for specific error responses
  if (!body.name) {
    throw ApiError.badRequest('Name is required');
  }

  // Any thrown error is automatically caught and formatted
  const result = {
    message: `Hello, ${body.name}!`,
    timestamp: new Date().toISOString(),
  };

  return result;
});
