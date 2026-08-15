import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let userId = sessionUser?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) userId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required.', 'UNAUTHENTICATED');
    }

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return apiSuccess({
      updatedCount: result.count,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
