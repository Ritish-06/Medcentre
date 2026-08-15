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
      throw new UnauthorizedError('Authentication is required to view pharmacy orders.', 'UNAUTHORIZED');
    }

    if (sessionUser.role !== 'PHARMACY' && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only pharmacy accounts can access pharmacy orders.', 'FORBIDDEN_ROLE');
    }

    let pharmacyId: string | undefined;

    if (sessionUser.role === 'PHARMACY') {
      const pharmacy = await prisma.pharmacy.findUnique({
        where: { userId: sessionUser.id },
      });
      if (!pharmacy) {
        throw new ForbiddenError('No pharmacy profile associated with this account.', 'PHARMACY_NOT_FOUND');
      }
      pharmacyId = pharmacy.id;
    }

    const whereClause: any = {};
    if (pharmacyId) whereClause.pharmacyId = pharmacyId;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            medicine: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ orders, pharmacyId });
  } catch (error) {
    return handleApiError(error);
  }
}
