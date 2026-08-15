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
    const speciality = searchParams.get('speciality') || '';

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { speciality: { contains: q } },
        { location: { contains: q } },
      ];
    }

    if (speciality && speciality !== 'ALL') {
      whereClause.speciality = { contains: speciality };
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { email: true, phone: true } },
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      doctors,
      totalCount: doctors.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
