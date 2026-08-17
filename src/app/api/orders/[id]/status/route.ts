import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, ForbiddenError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'PENDING',
  'PRESCRIPTION_REVIEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sessionUser = await getSessionUser();

    // 1. Fetch Order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        pharmacy: true,
      },
    });

    if (!order) {
      throw new NotFoundError(`Order '${id}' not found.`, 'ORDER_NOT_FOUND');
    }

    // 2. Strict Authorization Verification
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to update order status.', 'UNAUTHORIZED');
    }

    const body = await req.json();
    let targetStatus = body.status;
    const action = body.action;

    const isOrderOwner = order.userId === sessionUser.id;

    if (isOrderOwner && (action === 'CANCEL' || targetStatus === 'CANCELLED')) {
      if (order.status === 'DELIVERED') {
        throw new BadRequestError('Delivered orders cannot be cancelled.', 'ORDER_ALREADY_DELIVERED');
      }
      if (order.status === 'CANCELLED') {
        throw new BadRequestError('Order is already cancelled.', 'ORDER_ALREADY_CANCELLED');
      }
      targetStatus = 'CANCELLED';
    } else if (sessionUser.role === 'PHARMACY') {
      const userPharmacy = await prisma.pharmacy.findUnique({
        where: { userId: sessionUser.id },
      });
      if (!userPharmacy || userPharmacy.id !== order.pharmacyId) {
        throw new ForbiddenError(
          'You are not authorized to manage orders for another pharmacy.',
          'FORBIDDEN_PHARMACY_ORDER'
        );
      }
    } else if (sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only pharmacy staff, administrators, or order owners can update order status.', 'FORBIDDEN');
    }

    // Handle high-level workflow actions
    if (action) {
      switch (action.toUpperCase()) {
        case 'ACCEPT':
          targetStatus = 'CONFIRMED';
          break;
        case 'REJECT':
        case 'CANCEL':
          targetStatus = 'CANCELLED';
          break;
        case 'PREPARING':
          targetStatus = 'PREPARING';
          break;
        case 'READY':
          targetStatus = 'READY';
          break;
        case 'DISPATCH':
        case 'OUT_FOR_DELIVERY':
          targetStatus = 'OUT_FOR_DELIVERY';
          break;
        case 'DELIVER':
        case 'DELIVERED':
          targetStatus = 'DELIVERED';
          break;
        default:
          throw new BadRequestError(`Unknown order action '${action}'.`, 'INVALID_ACTION');
      }
    }

    if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
      throw new BadRequestError(
        `Invalid status '${targetStatus}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        'INVALID_STATUS'
      );
    }

    // 3. Transactional Status Update & Inventory Restoration
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If transitioning to CANCELLED and was not previously cancelled, restore inventory
      if (targetStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          const inventory = await tx.medicineInventory.findFirst({
            where: {
              pharmacyId: order.pharmacyId,
              medicineId: item.medicineId,
            },
          });

          if (inventory) {
            await tx.medicineInventory.update({
              where: { id: inventory.id },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      // If marked DELIVERED, mark payment COMPLETED if COD
      if (targetStatus === 'DELIVERED') {
        await tx.payment.updateMany({
          where: { orderId: order.id },
          data: {
            paymentStatus: 'COMPLETED',
            paidAt: new Date(),
          },
        });
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: targetStatus },
        include: {
          pharmacy: true,
          items: {
            include: {
              medicine: true,
            },
          },
          payment: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return updated;
    });

    // Dispatch real-time notification to patient
    let notifType: any = 'SYSTEM';
    let notifTitle = `Order Status: ${targetStatus}`;
    let notifMsg = `Your order ${updatedOrder.orderNumber} is now ${targetStatus.replace(/_/g, ' ')}.`;

    if (targetStatus === 'CONFIRMED') {
      notifType = 'ORDER_CONFIRMED';
      notifTitle = `Order Confirmed: ${updatedOrder.orderNumber}`;
      notifMsg = `Pharmacy accepted your order. Preparation is underway.`;
    } else if (targetStatus === 'PREPARING') {
      notifType = 'ORDER_PREPARING';
      notifTitle = `Order Preparing: ${updatedOrder.orderNumber}`;
      notifMsg = `Pharmacy is packing your prescription medications.`;
    } else if (targetStatus === 'READY') {
      notifType = 'ORDER_READY';
      notifTitle = `Order Ready: ${updatedOrder.orderNumber}`;
      notifMsg = `Your order is packed and ready for dispatch or pickup.`;
    } else if (targetStatus === 'OUT_FOR_DELIVERY') {
      notifType = 'ORDER_DELIVERED';
      notifTitle = `Out for Delivery: ${updatedOrder.orderNumber}`;
      notifMsg = `Delivery rider is on the way with your medicines!`;
    } else if (targetStatus === 'DELIVERED') {
      notifType = 'ORDER_DELIVERED';
      notifTitle = `Delivered: ${updatedOrder.orderNumber}`;
      notifMsg = `Your package has been successfully delivered. Thank you!`;
    }

    await createNotification({
      userId: updatedOrder.userId,
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      link: `/orders/${updatedOrder.id}`,
    });

    return apiSuccess({
      order: updatedOrder,
      message: `Order status successfully updated to ${targetStatus}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
