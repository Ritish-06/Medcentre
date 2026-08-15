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

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${id}' not found.`, 'DOCTOR_NOT_FOUND');
    }

    return apiSuccess({ doctor });
  } catch (error) {
    return handleApiError(error);
  }
}
