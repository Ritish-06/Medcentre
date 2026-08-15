import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl || req.url, res.statusCode, duration);
  });

  next();
}
