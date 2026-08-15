import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ADD Medicine to Prescription
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id: prescriptionId } = params;
    const body = await req.json();
    const { medicineName, strength, dosageForm, frequency, duration, quantity } = body;

    if (!medicineName || !strength) {
      throw new BadRequestError('Medicine name and strength are required.', 'MISSING_FIELDS');
    }

    // Verify prescription exists & ownership
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescription) {
      throw new NotFoundError(`Prescription '${prescriptionId}' not found.`, 'PRESCRIPTION_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && prescription.userId !== sessionUser.id) {
      throw new ForbiddenError('You can only modify your own prescriptions.', 'FORBIDDEN_PRESCRIPTION_ACCESS');
    }

    // Attempt to match DB medicine
    const dbMatch = await prisma.medicine.findFirst({
      where: {
        OR: [
          { name: { contains: medicineName } },
          { brandName: { contains: medicineName } },
        ],
      },
    });

    const item = await prisma.prescriptionMedicine.create({
      data: {
        prescriptionId,
        medicineId: dbMatch ? dbMatch.id : null,
        medicineName: dbMatch ? dbMatch.name : medicineName,
        strength: strength || '500mg',
        dosageForm: dosageForm || 'Tablet',
        frequency: frequency || 'Once daily',
        duration: duration || '5 days',
        quantity: Math.max(1, parseInt(quantity || '10', 10)),
        confidence: 1.0, // Manually added
        isVerified: true,
      },
      include: {
        medicine: true,
      },
    });

    return apiSuccess({ medicine: item }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// UPDATE Medicine in Prescription
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id: prescriptionId } = params;
    const body = await req.json();
    const { medicineId, medicineName, strength, dosageForm, frequency, duration, quantity } = body;

    if (!medicineId) {
      throw new BadRequestError('medicineId is required for updating.', 'MISSING_MEDICINE_ID');
    }

    // Verify prescription ownership
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescription) {
      throw new NotFoundError(`Prescription '${prescriptionId}' not found.`, 'PRESCRIPTION_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && prescription.userId !== sessionUser.id) {
      throw new ForbiddenError('You can only modify your own prescriptions.', 'FORBIDDEN_PRESCRIPTION_ACCESS');
    }

    const updated = await prisma.prescriptionMedicine.update({
      where: { id: medicineId },
      data: {
        medicineName: medicineName !== undefined ? medicineName : undefined,
        strength: strength !== undefined ? strength : undefined,
        dosageForm: dosageForm !== undefined ? dosageForm : undefined,
        frequency: frequency !== undefined ? frequency : undefined,
        duration: duration !== undefined ? duration : undefined,
        quantity: quantity !== undefined ? Math.max(1, parseInt(quantity, 10)) : undefined,
        isVerified: true,
      },
      include: {
        medicine: true,
      },
    });

    return apiSuccess({ medicine: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE Medicine from Prescription
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id: prescriptionId } = params;
    const { searchParams } = new URL(req.url);
    const medicineId = searchParams.get('medicineId');

    if (!medicineId) {
      throw new BadRequestError('medicineId query parameter is required.', 'MISSING_MEDICINE_ID');
    }

    // Verify prescription ownership
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescription) {
      throw new NotFoundError(`Prescription '${prescriptionId}' not found.`, 'PRESCRIPTION_NOT_FOUND');
    }

    if (sessionUser.role === 'PATIENT' && prescription.userId !== sessionUser.id) {
      throw new ForbiddenError('You can only modify your own prescriptions.', 'FORBIDDEN_PRESCRIPTION_ACCESS');
    }

    await prisma.prescriptionMedicine.delete({
      where: { id: medicineId },
    });

    return apiSuccess({ message: 'Medicine removed from prescription' });
  } catch (error) {
    return handleApiError(error);
  }
}
