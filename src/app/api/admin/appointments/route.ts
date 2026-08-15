import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, ForbiddenError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }
    if (sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN_ADMIN_ACCESS');
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { appointmentNumber: { contains: q } },
        { patient: { name: { contains: q } } },
        { patient: { email: { contains: q } } },
        { doctor: { name: { contains: q } } },
        { doctor: { speciality: { contains: q } } },
      ];
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { name: true, email: true, phone: true } },
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      appointments,
      totalCount: appointments.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
