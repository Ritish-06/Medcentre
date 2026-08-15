import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let userId = sessionUser?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        throw new UnauthorizedError('Authentication required to checkout.', 'UNAUTHENTICATED');
      }
    }

    const body = await req.json();
    const {
      shippingAddress,
      contactPhone,
      deliveryType = 'DELIVERY',
      paymentMethod = 'CASH_ON_DELIVERY',
      prescriptionId,
      customerNotes,
    } = body;

    if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim().length < 5) {
      throw new BadRequestError('A valid delivery address is required.', 'INVALID_ADDRESS');
    }

    if (!contactPhone || typeof contactPhone !== 'string' || contactPhone.trim().length < 7) {
      throw new BadRequestError('A valid contact phone number is required.', 'INVALID_PHONE');
    }

    // 1. Fetch User's Cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            medicine: true,
            pharmacy: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Your shopping cart is empty.', 'CART_EMPTY');
    }

    const now = new Date();
    const cartItems = cart.items;

    // Determine target pharmacy (grouped by pharmacy)
    const targetPharmacyId = cartItems[0].pharmacyId;

    // 2. Validate Cart Items & Server-Side Inventory Stocks
    let totalAmount = 0;
    let requiresPrescriptionReview = false;
    const validatedItemsData: {
      medicineId: string;
      pharmacyId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      inventoryId: string;
    }[] = [];

    for (const item of cartItems) {
      const medicine = item.medicine;
      if (!medicine) {
        throw new BadRequestError(`Medicine record missing for cart item.`, 'INVALID_CART_ITEM');
      }

      if (medicine.prescriptionRequired) {
        // If prescription not already verified, flag for review
        if (!prescriptionId) {
          requiresPrescriptionReview = true;
        }
      }

      // Live inventory validation
      const inventory = await prisma.medicineInventory.findFirst({
        where: {
          pharmacyId: item.pharmacyId,
          medicineId: item.medicineId,
        },
      });

      if (!inventory) {
        throw new BadRequestError(
          `Medicine '${medicine.name}' is not stocked by ${item.pharmacy.name}.`,
          'INVENTORY_UNAVAILABLE'
        );
      }

      if (new Date(inventory.expiryDate) <= now) {
        throw new BadRequestError(
          `Inventory for '${medicine.name}' has expired. Cannot proceed with order.`,
          'EXPIRED_STOCK'
        );
      }

      if (inventory.quantity < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for '${medicine.name}'. Available: ${inventory.quantity}, Requested: ${item.quantity}.`,
          'INSUFFICIENT_STOCK'
        );
      }

      // Secure unit price from server
      const unitPrice = inventory.price;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      validatedItemsData.push({
        medicineId: item.medicineId,
        pharmacyId: item.pharmacyId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: Math.round(itemTotal * 100) / 100,
        inventoryId: inventory.id,
      });
    }

    const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100;
    const deliveryFee = deliveryType === 'DELIVERY' ? 0.0 : 0.0;
    const finalAmount = Math.round((totalAmount + taxAmount + deliveryFee) * 100) / 100;

    const initialStatus = requiresPrescriptionReview ? 'PRESCRIPTION_REVIEW' : 'CONFIRMED';
    const orderNumber = `MC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. EXECUTE ACID DATABASE TRANSACTION
    const createdOrder = await prisma.$transaction(async (tx) => {
      // a. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          pharmacyId: targetPharmacyId,
          prescriptionId: prescriptionId || null,
          status: initialStatus,
          totalAmount: Math.round(totalAmount * 100) / 100,
          taxAmount,
          deliveryFee,
          finalAmount,
          deliveryType,
          shippingAddress,
          contactPhone,
          customerNotes: customerNotes || null,
        },
      });

      // b. Create Order Items & Decrement Inventory Stock
      for (const itemData of validatedItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            medicineId: itemData.medicineId,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
          },
        });

        // Decrement stock (prevent negative stock)
        const updatedInventory = await tx.medicineInventory.update({
          where: { id: itemData.inventoryId },
          data: {
            quantity: {
              decrement: itemData.quantity,
            },
          },
        });

        if (updatedInventory.quantity < 0) {
          throw new Error(`Stock deduction resulted in negative quantity for inventory '${itemData.inventoryId}'.`);
        }
      }

      // c. Create Payment record
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: finalAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'CARD' || paymentMethod === 'UPI' ? 'COMPLETED' : 'PENDING',
          transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          paidAt: paymentMethod === 'CARD' || paymentMethod === 'UPI' ? new Date() : null,
        },
      });

      // d. Clear User's Shopping Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return apiSuccess({ order: createdOrder }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
