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
        { orderNumber: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { email: { contains: q } } },
        { pharmacy: { name: { contains: q } } },
      ];
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        pharmacy: { select: { name: true, address: true } },
        items: {
          include: {
            medicine: { select: { name: true, strength: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      orders,
      totalCount: orders.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
