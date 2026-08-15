import { Response } from 'express';
import { HTTP_STATUS } from '../constants/http';
import { ApiErrorResponse, ApiSuccessResponse } from '../types/api';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    meta?: ApiSuccessResponse<T>['meta']
  ) {
    const responsePayload: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    };
    return res.status(statusCode).json(responsePayload);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST,
    code: string = 'ERROR',
    details?: any
  ) {
    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    };
    return res.status(statusCode).json(errorPayload);
  }
}
