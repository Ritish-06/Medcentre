import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to view notifications.', 'UNAUTHORIZED');
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: sessionUser.id, isRead: false },
    });

    return apiSuccess({
      notifications,
      unreadCount,
      totalCount: notifications.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to create notifications.', 'UNAUTHORIZED');
    }

    const body = await req.json();
    const { title, message, type = 'SYSTEM', link } = body;

    if (!title || !message) {
      throw new BadRequestError('title and message are required.', 'MISSING_NOTIFICATION_FIELDS');
    }

    const notification = await prisma.notification.create({
      data: {
        userId: sessionUser.id,
        title: title.trim(),
        message: message.trim(),
        type,
        link: link || null,
      },
    });

    return apiSuccess({ notification, message: 'Notification created.' }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
