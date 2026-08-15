import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http';

export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} was not found on this server`,
    },
  });
}
