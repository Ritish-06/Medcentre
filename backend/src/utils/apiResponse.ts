import { Response } from 'express';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http';
import { ApiErrorResponse, ApiSuccessResponse } from '../types/api';

/**
 * Creates standardized success JSON envelope:
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Creates standardized error JSON envelope:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Readable error message"
 *   }
 * }
 */
export function createErrorResponse(
  code: string = ERROR_CODES.INTERNAL_ERROR,
  message: string = 'An unexpected error occurred',
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

/**
 * Reusable Express response helper class
 */
export class ApiResponse {
  /**
   * Send JSON Success response
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    meta?: ApiSuccessResponse<T>['meta']
  ) {
    return res.status(statusCode).json(createSuccessResponse(data, meta));
  }

  /**
   * Send JSON Error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    code: string = ERROR_CODES.BAD_REQUEST,
    details?: any
  ) {
    return res.status(statusCode).json(createErrorResponse(code, message, details));
  }
}

// Shorthand function exports for clean controller syntax
export const sendSuccess = ApiResponse.success;
export const sendError = ApiResponse.error;
