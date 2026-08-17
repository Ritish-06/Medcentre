import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { createNotification } from '@/lib/notifications';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'RESCHEDULED',
  'COMPLETED',
  'CANCELLED',
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }

    const { id } = params;
    const body = await req.json();
    const { action, status, newDate, newTime, notes } = body;

    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [{ id }, { appointmentNumber: id }],
      },
      include: {
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundError(`Appointment '${id}' not found.`, 'APPOINTMENT_NOT_FOUND');
    }

    // Role-based & Owner Authorization
    const isAppointmentOwner = appointment.patientId === sessionUser.id;
    const isAssignedDoctor = appointment.doctor.userId === sessionUser.id;
    const isAdmin = sessionUser.role === 'ADMIN';

    if (isAppointmentOwner) {
      if (action && action.toUpperCase() !== 'CANCEL' && status !== 'CANCELLED') {
        throw new ForbiddenError('Patients can only cancel appointments.', 'FORBIDDEN_PATIENT_ACTION');
      }
    } else if (isAssignedDoctor) {
      // Assigned doctor can perform all doctor actions
    } else if (isAdmin) {
      // Admin has full management access
    } else {
      throw new ForbiddenError('You are not authorized to manage this appointment.', 'FORBIDDEN_APPOINTMENT_ACCESS');
    }

    let targetStatus = status;

    if (action) {
      switch (action.toUpperCase()) {
        case 'ACCEPT':
        case 'CONFIRM':
          targetStatus = 'CONFIRMED';
          break;
        case 'REJECT':
          targetStatus = 'REJECTED';
          break;
        case 'RESCHEDULE':
          targetStatus = 'RESCHEDULED';
          break;
        case 'COMPLETE':
          targetStatus = 'COMPLETED';
          break;
        case 'CANCEL':
          targetStatus = 'CANCELLED';
          break;
        default:
          throw new BadRequestError(`Invalid action '${action}'.`, 'INVALID_ACTION');
      }
    }

    if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
      throw new BadRequestError(
        `Invalid status '${targetStatus}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        'INVALID_STATUS'
      );
    }

    const updateData: any = { status: targetStatus };
    if (notes) updateData.notes = notes;

    // If Rescheduling, validate new date & time slot
    if (targetStatus === 'RESCHEDULED') {
      if (!newDate || !newTime) {
        throw new BadRequestError('newDate and newTime are required when rescheduling.', 'MISSING_RESCHEDULE_SLOT');
      }

      const todayStr = new Date().toISOString().split('T')[0];
      if (newDate < todayStr) {
        throw new BadRequestError('Cannot reschedule to a past date.', 'PAST_DATE_ERROR');
      }

      // Check double-booking on new slot
      const existingSlot = await prisma.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          date: newDate,
          time: newTime,
          id: { not: appointment.id },
          status: { notIn: ['CANCELLED', 'REJECTED'] },
        },
      });

      if (existingSlot) {
        throw new BadRequestError(
          `Slot '${newTime}' on ${newDate} is already booked. Please pick another slot.`,
          'DOUBLE_BOOKING_PREVENTED'
        );
      }

      updateData.rescheduledToDate = newDate;
      updateData.rescheduledToTime = newTime;
      updateData.date = newDate;
      updateData.time = newTime;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: updateData,
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

    // Dispatch notification to patient
    let aptNotifType: any = 'SYSTEM';
    let aptNotifTitle = `Appointment Status: ${targetStatus}`;
    let aptNotifMsg = `Your appointment with ${updatedAppointment.doctor.name} is now ${targetStatus}.`;

    if (targetStatus === 'CONFIRMED') {
      aptNotifType = 'APPOINTMENT_CONFIRMED';
      aptNotifTitle = `Appointment Confirmed!`;
      aptNotifMsg = `${updatedAppointment.doctor.name} confirmed your appointment on ${updatedAppointment.date} at ${updatedAppointment.time}.`;
    } else if (targetStatus === 'RESCHEDULED') {
      aptNotifType = 'APPOINTMENT_REMINDER';
      aptNotifTitle = `Appointment Rescheduled`;
      aptNotifMsg = `Your consultation is rescheduled to ${updatedAppointment.date} at ${updatedAppointment.time}.`;
    }

    await createNotification({
      userId: updatedAppointment.patientId,
      title: aptNotifTitle,
      message: aptNotifMsg,
      type: aptNotifType,
      link: '/appointments',
    });

    return apiSuccess({
      appointment: updatedAppointment,
      message: `Appointment status updated to ${targetStatus}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
