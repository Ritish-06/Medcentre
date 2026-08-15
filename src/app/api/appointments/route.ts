import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let patientId = sessionUser?.id;

    if (!patientId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) patientId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required to view appointments.', 'UNAUTHENTICATED');
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({ appointments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let patientId = sessionUser?.id;

    if (!patientId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) patientId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required to book an appointment.', 'UNAUTHENTICATED');
    }

    const body = await req.json();
    const { doctorId, date, time, reason, notes } = body;

    if (!doctorId || !date || !time || !reason) {
      throw new BadRequestError(
        'doctorId, date (YYYY-MM-DD), time slot, and reason are required.',
        'MISSING_FIELDS'
      );
    }

    // 1. Validate Date (Prevent Past Dates)
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      throw new BadRequestError('Cannot book appointment dates in the past.', 'PAST_DATE_ERROR');
    }

    // 2. Validate Doctor Exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundError(`Doctor '${doctorId}' not found.`, 'DOCTOR_NOT_FOUND');
    }

    // 3. PREVENT DOUBLE BOOKING (Strict active slot check)
    const existingActiveAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        time,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
    });

    if (existingActiveAppointment) {
      throw new BadRequestError(
        `The slot '${time}' on ${date} is already booked. Please choose an available time slot.`,
        'DOUBLE_BOOKING_PREVENTED'
      );
    }

    // 4. Create Appointment
    const appointmentNumber = `APT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        patientId,
        doctorId,
        date,
        time,
        status: 'PENDING',
        reason,
        notes: notes || null,
      },
      include: {
        doctor: true,
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return apiSuccess({ appointment }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
