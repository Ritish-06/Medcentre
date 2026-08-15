import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const existing = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Prescription with ID '${id}' was not found.`, 'PRESCRIPTION_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && existing.userId !== sessionUser.id) {
      throw new ForbiddenError('You can only confirm your own prescriptions.', 'FORBIDDEN_PRESCRIPTION_ACCESS');
    }

    // Mark prescription status as VERIFIED
    const confirmedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
      include: {
        ocrResult: true,
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
    });

    // Mark all medicine items as verified
    await prisma.prescriptionMedicine.updateMany({
      where: { prescriptionId: id },
      data: { isVerified: true },
    });

    return apiSuccess({
      prescription: confirmedPrescription,
      message: 'Prescription verified successfully!',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
