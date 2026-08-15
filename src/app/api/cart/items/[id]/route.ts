import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id } = params;
    const body = await req.json();
    const { quantity: requestedQty } = body;

    const qty = parseInt(requestedQty, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestError('Quantity must be a positive integer greater than 0.', 'INVALID_QUANTITY');
    }

    // 1. Fetch CartItem with Cart ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });
    if (!cartItem) {
      throw new NotFoundError(`Cart item '${id}' not found.`, 'ITEM_NOT_FOUND');
    }

    if (cartItem.cart.userId !== sessionUser.id && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('You are only authorized to modify your own cart.', 'FORBIDDEN_CART_ACCESS');
    }

    // 2. Fetch inventory for stock check
    const inventory = await prisma.medicineInventory.findFirst({
      where: {
        pharmacyId: cartItem.pharmacyId,
        medicineId: cartItem.medicineId,
      },
    });

    if (!inventory) {
      throw new BadRequestError('Medicine inventory no longer available.', 'INVENTORY_NOT_FOUND');
    }

    if (qty > inventory.quantity) {
      throw new BadRequestError(
        `Requested quantity (${qty}) exceeds available inventory stock (${inventory.quantity}).`,
        'INSUFFICIENT_STOCK'
      );
    }

    // 3. Update CartItem quantity and unitPrice
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: qty,
        unitPrice: inventory.price, // Refresh server price
      },
      include: {
        medicine: true,
        pharmacy: true,
      },
    });

    return apiSuccess({ item: updatedItem });
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
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id } = params;

    const existing = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!existing) {
      throw new NotFoundError(`Cart item '${id}' not found.`, 'ITEM_NOT_FOUND');
    }

    if (existing.cart.userId !== sessionUser.id && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('You are only authorized to modify your own cart.', 'FORBIDDEN_CART_ACCESS');
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return apiSuccess({ message: 'Cart item removed successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
