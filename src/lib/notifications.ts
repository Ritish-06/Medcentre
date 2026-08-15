import { prisma } from './prisma';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type:
    | 'PRESCRIPTION_PROCESSED'
    | 'PRESCRIPTION_VERIFIED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_PREPARING'
    | 'ORDER_READY'
    | 'ORDER_DELIVERED'
    | 'APPOINTMENT_CONFIRMED'
    | 'APPOINTMENT_REMINDER'
    | 'MEDICINE_REMINDER'
    | 'SYSTEM';
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('[Notification Dispatch Error]:', error);
    return null;
  }
}
