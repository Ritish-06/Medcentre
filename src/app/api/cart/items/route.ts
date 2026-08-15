import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to add items to cart.', 'UNAUTHORIZED');
    }
    const userId = sessionUser.id;

    const body = await req.json();
    const { medicineId, pharmacyId, quantity: requestedQty } = body;
    const qty = Math.max(1, parseInt(requestedQty || '1', 10));

    if (!medicineId || !pharmacyId) {
      throw new BadRequestError('medicineId and pharmacyId are required parameters.', 'MISSING_FIELDS');
    }

    // 1. Verify Medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });
    if (!medicine) {
      throw new NotFoundError(`Medicine with ID '${medicineId}' not found.`, 'MEDICINE_NOT_FOUND');
    }

    // 2. Verify Pharmacy exists and is active
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });
    if (!pharmacy || !pharmacy.active) {
      throw new BadRequestError('Selected pharmacy is invalid or currently inactive.', 'PHARMACY_INACTIVE');
    }

    // 3. SERVER-SIDE INVENTORY & PRICE LOOKUP (Never trust frontend price!)
    const inventory = await prisma.medicineInventory.findFirst({
      where: {
        pharmacyId,
        medicineId,
      },
    });

    if (!inventory) {
      throw new BadRequestError('This medicine is not stocked by the selected pharmacy.', 'INVENTORY_NOT_FOUND');
    }

    // 4. Validate Expiry Date
    const now = new Date();
    if (new Date(inventory.expiryDate) <= now) {
      throw new BadRequestError('This medicine inventory item has expired and cannot be added.', 'EXPIRED_INVENTORY');
    }

    // 5. Validate Stock Quantity
    if (inventory.quantity <= 0) {
      throw new BadRequestError('This medicine is currently out of stock.', 'OUT_OF_STOCK');
    }

    // 6. Find or create User Cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        medicineId,
        pharmacyId,
      },
    });

    const newTotalQty = existingItem ? existingItem.quantity + qty : qty;

    if (newTotalQty > inventory.quantity) {
      throw new BadRequestError(
        `Cannot add ${qty} units. Total requested (${newTotalQty}) exceeds available stock (${inventory.quantity}).`,
        'INSUFFICIENT_STOCK'
      );
    }

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newTotalQty,
          unitPrice: inventory.price, // Server price
        },
        include: {
          medicine: true,
          pharmacy: true,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          medicineId,
          pharmacyId,
          quantity: qty,
          unitPrice: inventory.price, // Server price
        },
        include: {
          medicine: true,
          pharmacy: true,
        },
      });
    }

    return apiSuccess({ item: cartItem }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
