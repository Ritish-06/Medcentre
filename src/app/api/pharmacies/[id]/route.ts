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

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inventories: true },
        },
      },
    });

    if (!pharmacy) {
      throw new NotFoundError(`Pharmacy with ID '${id}' was not found.`, 'PHARMACY_NOT_FOUND');
    }

    return apiSuccess({ pharmacy });
  } catch (error) {
    return handleApiError(error);
  }
}
