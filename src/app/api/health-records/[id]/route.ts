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
      throw new UnauthorizedError('Authentication is required to view health records.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const record = await prisma.healthRecord.findUnique({
      where: { id },
      include: {
        prescription: {
          include: {
            medicines: true,
            doctor: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundError(`Health record with ID '${id}' not found.`, 'RECORD_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && record.userId !== sessionUser.id) {
      throw new ForbiddenError(
        'Access denied. You are not authorized to view this health record.',
        'FORBIDDEN_RECORD_ACCESS'
      );
    }

    return apiSuccess({ record });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to delete health records.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const record = await prisma.healthRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundError(`Health record with ID '${id}' not found.`, 'RECORD_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && record.userId !== sessionUser.id) {
      throw new ForbiddenError(
        'Access denied. You are not authorized to delete this health record.',
        'FORBIDDEN_RECORD_ACCESS'
      );
    }

    await prisma.healthRecord.delete({
      where: { id },
    });

    return apiSuccess({ message: 'Health record deleted successfully.' });
  } catch (error) {
    return handleApiError(error);
  }
}
