import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, UnauthorizedError, ForbiddenError, BadRequestError } from '@/lib/api/error';
import { getSessionUser, Role } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function verifyInventoryOwnership(inventoryId: string, userId: string, role: string) {
  const inventory = await prisma.medicineInventory.findUnique({
    where: { id: inventoryId },
    include: { pharmacy: true },
  });

  if (!inventory) {
    throw new NotFoundError(`Inventory item '${inventoryId}' was not found.`, 'INVENTORY_NOT_FOUND');
  }

  if (role !== Role.ADMIN) {
    if (role !== Role.PHARMACY || inventory.pharmacy.userId !== userId) {
      throw new ForbiddenError(
        'You are only authorized to modify your own pharmacy inventory.',
        'FORBIDDEN_OWNERSHIP'
      );
    }
  }

  return inventory;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to update inventory.', 'UNAUTHORIZED');
    }

    const { id } = params;
    await verifyInventoryOwnership(id, sessionUser.id, sessionUser.role);

    const body = await req.json();
    const updateData: any = {};

    if (body.quantity !== undefined) {
      const q = parseInt(body.quantity, 10);
      if (isNaN(q) || q < 0) throw new BadRequestError('Quantity must be a positive integer.');
      updateData.quantity = q;
    }
    if (body.price !== undefined) {
      const p = parseFloat(body.price);
      if (isNaN(p) || p < 0) throw new BadRequestError('Price must be a positive number.');
      updateData.price = p;
    }
    if (body.MRP !== undefined) {
      const m = parseFloat(body.MRP);
      if (isNaN(m) || m < 0) throw new BadRequestError('MRP must be a positive number.');
      updateData.MRP = m;
    }
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber.trim();
    if (body.expiryDate !== undefined) updateData.expiryDate = new Date(body.expiryDate);

    const updatedInventory = await prisma.medicineInventory.update({
      where: { id },
      data: updateData,
      include: {
        medicine: true,
      },
    });

    return apiSuccess({ inventory: updatedInventory });
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
      throw new UnauthorizedError('Authentication is required to delete inventory.', 'UNAUTHORIZED');
    }

    const { id } = params;
    await verifyInventoryOwnership(id, sessionUser.id, sessionUser.role);

    await prisma.medicineInventory.delete({
      where: { id },
    });

    return apiSuccess({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
