import { Request, Response } from 'express';

export class HealthController {
  static async check(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      message: 'MedCentre backend is running',
    });
  }
}
