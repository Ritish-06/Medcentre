import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verify database connectivity
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {
      console.warn('DB check failed during healthcheck, attempting connection...', e);
    }

    return apiSuccess({
      status: 'online',
      service: 'MedCentre API Foundation',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
