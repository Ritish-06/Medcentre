import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to view orders.', 'UNAUTHORIZED');
    }

    const orders = await prisma.order.findMany({
      where: { userId: sessionUser.id },
      include: {
        pharmacy: true,
        items: {
          include: {
            medicine: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
