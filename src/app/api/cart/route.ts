import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          medicine: true,
          pharmacy: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            medicine: true,
            pharmacy: true,
          },
        },
      },
    });
  }

  return cart;
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return apiSuccess({
        cart: { items: [] },
        totalAmount: 0,
        itemCount: 0,
      });
    }

    const cart = await getOrCreateCart(sessionUser.id);
    const now = new Date();

    // Verify stock availability & recalculate totals server-side
    let totalAmount = 0;
    let itemCount = 0;

    const validatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const inventory = await prisma.medicineInventory.findFirst({
          where: {
            pharmacyId: item.pharmacyId,
            medicineId: item.medicineId,
          },
        });

        const isExpired = inventory ? new Date(inventory.expiryDate) <= now : true;
        const availableStock = inventory ? inventory.quantity : 0;
        const isOutOfStock = availableStock <= 0;
        const isAvailable = Boolean(inventory && !isExpired && availableStock > 0 && item.pharmacy.active);

        // Server-side updated price
        const currentUnitPrice = inventory ? inventory.price : item.unitPrice;
        const itemTotal = currentUnitPrice * item.quantity;

        if (isAvailable) {
          totalAmount += itemTotal;
          itemCount += item.quantity;
        }

        return {
          id: item.id,
          medicineId: item.medicineId,
          pharmacyId: item.pharmacyId,
          quantity: item.quantity,
          unitPrice: currentUnitPrice,
          totalPrice: Math.round(itemTotal * 100) / 100,
          availableStock,
          isExpired,
          isOutOfStock,
          isAvailable,
          medicine: item.medicine,
          pharmacy: item.pharmacy,
        };
      })
    );

    return apiSuccess({
      cartId: cart.id,
      items: validatedItems,
      itemCount,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let userId = sessionUser?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) userId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required.', 'UNAUTHENTICATED');
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return apiSuccess({ message: 'Cart cleared successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
