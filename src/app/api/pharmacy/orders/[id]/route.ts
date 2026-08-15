import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        prescription: {
          include: {
            ocrResult: true,
            medicines: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError(`Order '${id}' not found.`, 'ORDER_NOT_FOUND');
    }

    return apiSuccess({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
