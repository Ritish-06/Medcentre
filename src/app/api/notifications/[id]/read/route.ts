import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundError(`Notification '${id}' not found.`, 'NOTIFICATION_NOT_FOUND');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return apiSuccess({
      notification: updated,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
