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
      throw new UnauthorizedError('Authentication is required to view prescriptions.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        ocrResult: true,
        medicines: {
          include: {
            medicine: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundError(`Prescription with ID '${id}' was not found.`, 'PRESCRIPTION_NOT_FOUND');
    }

    // Role & Ownership Access Control:
    // If PATIENT: Must be owner of prescription
    if (sessionUser.role === 'PATIENT' && prescription.userId !== sessionUser.id) {
      throw new ForbiddenError(
        'Access denied. You are only authorized to access your own prescriptions.',
        'FORBIDDEN_PRESCRIPTION_ACCESS'
      );
    }

    return apiSuccess({ prescription });
  } catch (error) {
    return handleApiError(error);
  }
}
