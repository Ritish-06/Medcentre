import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN');
    }

    const { id } = params;
    const body = await req.json();

    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundError(`Medicine '${id}' not found.`, 'MEDICINE_NOT_FOUND');
    }

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : medicine.name,
        genericName: body.genericName !== undefined ? body.genericName : medicine.genericName,
        brandName: body.brandName !== undefined ? body.brandName : medicine.brandName,
        strength: body.strength !== undefined ? body.strength : medicine.strength,
        dosageForm: body.dosageForm !== undefined ? body.dosageForm : medicine.dosageForm,
        category: body.category !== undefined ? body.category : medicine.category,
        manufacturer: body.manufacturer !== undefined ? body.manufacturer : medicine.manufacturer,
        prescriptionRequired:
          body.prescriptionRequired !== undefined
            ? Boolean(body.prescriptionRequired)
            : medicine.prescriptionRequired,
        activeIngredients:
          body.activeIngredients !== undefined ? body.activeIngredients : medicine.activeIngredients,
      },
    });

    return apiSuccess({
      medicine: updated,
      message: 'Medicine updated successfully.',
    });
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
    if (sessionUser && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN');
    }

    const { id } = params;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      throw new NotFoundError(`Medicine '${id}' not found.`, 'MEDICINE_NOT_FOUND');
    }

    await prisma.medicine.delete({
      where: { id },
    });

    return apiSuccess({ message: 'Medicine deleted successfully.' });
  } catch (error) {
    return handleApiError(error);
  }
}
