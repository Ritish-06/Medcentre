import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

const STANDARD_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: doctorId } = params;
    const { searchParams } = new URL(req.url);

    // Default to today or tomorrow
    const todayStr = new Date().toISOString().split('T')[0];
    const requestedDate = searchParams.get('date') || todayStr;

    // Validate Doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${doctorId}' not found.`, 'DOCTOR_NOT_FOUND');
    }

    // Validate date format and prevent past appointments
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      throw new BadRequestError('Date must be formatted as YYYY-MM-DD.', 'INVALID_DATE_FORMAT');
    }

    if (requestedDate < todayStr) {
      throw new BadRequestError('Cannot view slots or book appointments in the past.', 'PAST_DATE_ERROR');
    }

    // Query active appointments for this doctor on the selected date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: requestedDate,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
      select: {
        time: true,
        status: true,
        id: true,
      },
    });

    const bookedTimes = new Set(bookedAppointments.map((a) => a.time));

    const slots = STANDARD_SLOTS.map((slotTime) => {
      const isBooked = bookedTimes.has(slotTime);
      return {
        time: slotTime,
        date: requestedDate,
        isAvailable: !isBooked,
      };
    });

    return apiSuccess({
      doctorId,
      doctorName: doctor.name,
      speciality: doctor.speciality,
      date: requestedDate,
      slots,
      availableCount: slots.filter((s) => s.isAvailable).length,
      totalSlots: slots.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
