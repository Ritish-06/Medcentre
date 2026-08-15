import { ERROR_CODES, HTTP_STATUS } from '../constants/http';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    errorCode: string = ERROR_CODES.BAD_REQUEST,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, details);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Access denied for this role') {
    return new AppError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
  }

  static validation(message: string, details?: any) {
    return new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, details);
  }

  static internal(message: string = 'Internal server error') {
    return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
  }
}
