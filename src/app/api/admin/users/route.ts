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
    const role = searchParams.get('role') || '';

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    if (role && role !== 'ALL') {
      whereClause.role = role.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            appointments: true,
            prescriptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      users,
      totalCount: users.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
