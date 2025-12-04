/**
 * API Utilities
 * Centralized exports for API handlers and utilities
 */

export {
  apiHandler,
  withErrorHandling,
  successResponse,
  errorResponse,
  ApiError,
  type ApiHandlerFunction,
  type ApiHandlerOptions,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from './handler';
