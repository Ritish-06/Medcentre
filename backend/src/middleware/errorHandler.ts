import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';
import { AppError } from '../utils/appError';
import { logger } from '../config/logger';

/**
 * Centralized Express Error Handling Middleware
 * Handles: 400, 401, 403, 404, 409, 422, 500
 * Ensures stack traces and sensitive internal paths are never leaked to clients in production.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Handled AppError (and its subclasses: 400, 401, 403, 404, 409, 422, 500)
  if (err instanceof AppError) {
    logger.warn(`[${err.statusCode}] AppError: [${err.errorCode}] ${err.message}`, {
      path: req.path,
      method: req.method,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  // 2. Zod Schema Validation Error (422 Unprocessable Entity)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn('422 Validation Error', { path: req.path, errors: formattedErrors });

    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Request payload validation failed',
        details: formattedErrors,
      },
    });
  }

  // 3. Malformed JSON Body Parse Error (400 Bad Request)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    logger.warn('400 Malformed JSON', { path: req.path });
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Malformed JSON payload in request body',
      },
    });
  }

  // 4. JWT Authentication Errors (401 Unauthorized)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn(`401 JWT Error: ${err.message}`, { path: req.path });
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: err.name === 'TokenExpiredError' ? 'Authentication token has expired' : 'Invalid authentication token',
      },
    });
  }

  // 5. Prisma Database Errors (409 Conflict / 404 Not Found)
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'Field';
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: `Unique constraint conflict on ${Array.isArray(target) ? target.join(', ') : target}`,
        },
      });
    }
    if (err.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Requested record was not found in the database',
        },
      });
    }
  }

  // 6. Unhandled Runtime Server Error (500 Internal Server Error)
  logger.error(`[500] Unhandled Exception: ${err.message || 'Unknown error'}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProduction ? 'An unexpected internal server error occurred' : (err.message || 'Internal server error'),
    },
  });
}
