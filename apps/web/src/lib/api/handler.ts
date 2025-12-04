import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}

/**
 * Standard API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * API Handler Options
 */
export interface ApiHandlerOptions {
  requireAuth?: boolean;
  rateLimit?: {
    key: string;
    limit: number;
  };
}

/**
 * API Handler Function Type
 */
export type ApiHandlerFunction<T = any> = (
  req: NextRequest,
  context?: any
) => Promise<T>;

/**
 * Create standardized error response
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Centralized API handler wrapper
 * Handles errors, logging, and standard response formatting
 */
export function apiHandler<T = any>(
  handler: ApiHandlerFunction<T>,
  options: ApiHandlerOptions = {}
) {
  return async (
    req: NextRequest,
    context?: any
  ): Promise<NextResponse<ApiSuccessResponse<T> | ApiErrorResponse>> => {
    try {
      // Execute the handler
      const result = await handler(req, context);

      // Return success response
      return successResponse(result);
    } catch (error) {
      // Log error for debugging
      console.error('[API Error]', {
        path: req.nextUrl.pathname,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return errorResponse(
          'Validation failed',
          400,
          error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        );
      }

      // Handle custom API errors
      if (error instanceof ApiError) {
        return errorResponse(error.message, error.status, error.details);
      }

      // Handle database errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;

        // Postgres unique violation
        if (dbError.code === '23505') {
          return errorResponse('Resource already exists', 409);
        }

        // Postgres foreign key violation
        if (dbError.code === '23503') {
          return errorResponse('Related resource not found', 404);
        }
      }

      // Handle generic errors
      if (error instanceof Error) {
        // Don't expose internal error details in production
        const message =
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message;

        return errorResponse(message, 500);
      }

      // Fallback error
      return errorResponse('An unexpected error occurred', 500);
    }
  };
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: any) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static conflict(message: string, details?: any) {
    return new ApiError(message, 409, details);
  }

  static rateLimit(message: string = 'Rate limit exceeded') {
    return new ApiError(message, 429);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

/**
 * Async wrapper for route handlers
 * Catches any thrown errors and converts them to error responses
 */
export function withErrorHandling<T = any>(
  handler: ApiHandlerFunction<NextResponse<T>>
) {
  return async (
    req: NextRequest,
    context?: any
  ): Promise<NextResponse<T | ApiErrorResponse>> => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('[Route Error]', {
        path: req.nextUrl.pathname,
        method: req.method,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      if (error instanceof ApiError) {
        return errorResponse(error.message, error.status, error.details) as any;
      }

      if (error instanceof Error) {
        return errorResponse(
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message,
          500
        ) as any;
      }

      return errorResponse('An unexpected error occurred', 500) as any;
    }
  };
}
