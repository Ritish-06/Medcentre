import { NextResponse } from 'next/server';
import { apiError } from './response';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code: string = 'BAD_REQUEST', details?: unknown) {
    super(message, code, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required.', code: string = 'UNAUTHORIZED') {
    super(message, code, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied. You do not have permission for this resource.', code: string = 'FORBIDDEN') {
    super(message, code, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found.', code: string = 'NOT_FOUND') {
    super(message, code, 404);
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Always log full error on server
  console.error('[API Security Log - Error]:', error);

  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.statusCode, error.details);
  }

  // Sanitize internal server errors to avoid leaking stack traces or SQL/DB details
  const safeMessage =
    process.env.NODE_ENV === 'development' && error instanceof Error
      ? error.message
      : 'An unexpected internal server error occurred.';

  return apiError('INTERNAL_SERVER_ERROR', safeMessage, 500);
}
