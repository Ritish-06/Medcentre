import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['TAKEN', 'SKIPPED', 'SNOOZED'];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: reminderId } = params;
    const body = await req.json();
    const { action, notes } = body;

    const normalizedAction = (action || '').toUpperCase();

    if (!VALID_ACTIONS.includes(normalizedAction)) {
      throw new BadRequestError(
        `Invalid action '${action}'. Allowed: ${VALID_ACTIONS.join(', ')}`,
        'INVALID_ADHERENCE_ACTION'
      );
    }

    const reminder = await prisma.medicationReminder.findUnique({
      where: { id: reminderId },
    });

    if (!reminder) {
      throw new NotFoundError(`Reminder with ID '${reminderId}' not found.`, 'REMINDER_NOT_FOUND');
    }

    const now = new Date();
    const actionDate = now.toISOString().split('T')[0];
    const actionTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If Snoozed, update snoozedUntil on reminder
    if (normalizedAction === 'SNOOZED') {
      const snoozedUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins snooze
      await prisma.medicationReminder.update({
        where: { id: reminderId },
        data: { snoozedUntil },
      });
    }

    const log = await prisma.adherenceLog.create({
      data: {
        reminderId,
        action: normalizedAction,
        actionDate,
        actionTime,
        notes: notes || null,
      },
    });

    const updatedReminder = await prisma.medicationReminder.findUnique({
      where: { id: reminderId },
      include: {
        adherenceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return apiSuccess({
      log,
      reminder: updatedReminder,
      message: `Medication marked as ${normalizedAction}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
