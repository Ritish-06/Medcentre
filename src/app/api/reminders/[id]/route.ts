import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sessionUser = await getSessionUser();

    const reminder = await prisma.medicationReminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      throw new NotFoundError(`Reminder '${id}' not found.`, 'REMINDER_NOT_FOUND');
    }

    if (sessionUser && sessionUser.role === 'PATIENT' && reminder.userId !== sessionUser.id) {
      throw new ForbiddenError('You are not authorized to delete this reminder.', 'FORBIDDEN');
    }

    await prisma.medicationReminder.delete({
      where: { id },
    });

    return apiSuccess({ message: 'Reminder deleted successfully.' });
  } catch (error) {
    return handleApiError(error);
  }
}
