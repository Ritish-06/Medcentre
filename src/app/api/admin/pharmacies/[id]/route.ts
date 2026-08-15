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

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      throw new NotFoundError(`Pharmacy '${id}' not found.`, 'PHARMACY_NOT_FOUND');
    }

    const updated = await prisma.pharmacy.update({
      where: { id },
      data: {
        active: body.active !== undefined ? Boolean(body.active) : pharmacy.active,
        name: body.name !== undefined ? body.name : pharmacy.name,
        address: body.address !== undefined ? body.address : pharmacy.address,
        phone: body.phone !== undefined ? body.phone : pharmacy.phone,
        openingHours: body.openingHours !== undefined ? body.openingHours : pharmacy.openingHours,
        deliveryAvailable:
          body.deliveryAvailable !== undefined ? Boolean(body.deliveryAvailable) : pharmacy.deliveryAvailable,
        pickupAvailable:
          body.pickupAvailable !== undefined ? Boolean(body.pickupAvailable) : pharmacy.pickupAvailable,
      },
    });

    return apiSuccess({
      pharmacy: updated,
      message: `Pharmacy status updated (active: ${updated.active}).`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
