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

    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundError(`Medicine with ID '${id}' was not found.`, 'MEDICINE_NOT_FOUND');
    }

    return apiSuccess({ medicine });
  } catch (error) {
    return handleApiError(error);
  }
}
