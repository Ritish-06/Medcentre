import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';

export class HealthController {
  static async check(req: Request, res: Response) {
    const isDbConnected = await checkDatabaseConnection();

    return ApiResponse.success(res, {
      service: 'medcentre-backend',
      status: isDbConnected ? 'healthy' : 'degraded',
      message: 'MedCentre backend is running',
      database: isDbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  }
}
