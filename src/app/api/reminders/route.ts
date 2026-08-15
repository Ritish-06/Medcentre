import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to access reminders.', 'UNAUTHORIZED');
    }

    const reminders = await prisma.medicationReminder.findMany({
      where: { userId: sessionUser.id },
      include: {
        adherenceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { time: 'asc' },
    });

    return apiSuccess({
      reminders,
      totalCount: reminders.length,
      activeCount: reminders.filter((r) => r.isActive).length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to create reminders.', 'UNAUTHORIZED');
    }

    const body = await req.json();
    const {
      medicineName,
      dose,
      time,
      frequency = 'ONCE_DAILY',
      startDate = new Date().toISOString().split('T')[0],
      endDate,
      instructions,
    } = body;

    if (!medicineName || !dose || !time || !endDate) {
      throw new BadRequestError(
        'medicineName, dose, time (e.g. 08:00 AM), and endDate are required.',
        'MISSING_REMINDER_FIELDS'
      );
    }

    const reminder = await prisma.medicationReminder.create({
      data: {
        userId: sessionUser.id,
        medicineName: medicineName.trim(),
        dose: dose.trim(),
        time: time.trim(),
        frequency,
        startDate,
        endDate,
        instructions: instructions ? instructions.trim() : null,
        isActive: true,
      },
      include: {
        adherenceLogs: true,
      },
    });

    // Automatically trigger a notification
    await createNotification({
      userId: sessionUser.id,
      title: `Medication Reminder Created: ${reminder.medicineName}`,
      message: `Scheduled ${reminder.dose} at ${reminder.time} (${reminder.frequency.replace(/_/g, ' ')}).`,
      type: 'MEDICINE_REMINDER',
      link: '/reminders',
    });

    return apiSuccess({ reminder, message: 'Medication reminder scheduled.' }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
