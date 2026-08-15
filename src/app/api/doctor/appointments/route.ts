import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to view doctor appointments.', 'UNAUTHORIZED');
    }

    if (sessionUser.role !== 'DOCTOR' && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only doctors can access doctor appointments.', 'FORBIDDEN_ROLE');
    }

    let doctorId: string | undefined;

    if (sessionUser.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: sessionUser.id },
      });
      if (!doctorProfile) {
        throw new ForbiddenError('No doctor profile associated with this account.', 'DOCTOR_NOT_FOUND');
      }
      doctorId = doctorProfile.id;
    }

    const whereClause: any = {};
    if (doctorId) whereClause.doctorId = doctorId;

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: true,
      },
      orderBy: { date: 'asc' },
    });

    return apiSuccess({ appointments, doctorId });
  } catch (error) {
    return handleApiError(error);
  }
}
