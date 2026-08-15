import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to view order details.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        pharmacy: true,
        items: {
          include: {
            medicine: true,
          },
        },
        payment: true,
        prescription: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order '${id}' not found.`, 'ORDER_NOT_FOUND');
    }

    // Role & Ownership Authorization
    if (sessionUser.role === 'PATIENT' && order.userId !== sessionUser.id) {
      throw new ForbiddenError(
        'Access denied. You are only authorized to view your own orders.',
        'FORBIDDEN_ORDER_ACCESS'
      );
    }

    if (sessionUser.role === 'PHARMACY') {
      const userPharmacy = await prisma.pharmacy.findUnique({
        where: { userId: sessionUser.id },
      });
      if (!userPharmacy || userPharmacy.id !== order.pharmacyId) {
        throw new ForbiddenError(
          'Access denied. You are only authorized to view orders placed with your pharmacy.',
          'FORBIDDEN_ORDER_ACCESS'
        );
      }
    }

    return apiSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
