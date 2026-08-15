import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ERROR_CODES, HTTP_STATUS } from '../constants/http';
import { AppError } from '../utils/appError';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Handled AppError
  if (err instanceof AppError) {
    logger.warn(`AppError: [${err.errorCode}] ${err.message}`, { path: req.path, details: err.details });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn('Validation Error', { path: req.path, errors: formattedErrors });
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Request payload validation failed',
        details: formattedErrors,
      },
    });
  }

  // 3. Prisma Known Request Errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target || 'Field';
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: {
          code: ERROR_CODES.CONFLICT,
          message: `Unique constraint violation on ${target}`,
        },
      });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: 'Requested record was not found in the database',
        },
      });
    }
  }

  // 4. Unhandled Internal Server Errors
  logger.error(`Unhandled Exception: ${err.message}`, err);

  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProduction ? 'An unexpected internal server error occurred' : err.message,
    },
  });
}
