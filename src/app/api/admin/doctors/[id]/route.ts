import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN');
    }

    const { id } = params;
    const body = await req.json();

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundError(`Doctor profile '${id}' not found.`, 'DOCTOR_NOT_FOUND');
    }

    const updated = await prisma.doctorProfile.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : doctor.name,
        speciality: body.speciality !== undefined ? body.speciality : doctor.speciality,
        qualification: body.qualification !== undefined ? body.qualification : doctor.qualification,
        experience: body.experience !== undefined ? parseInt(body.experience, 10) : doctor.experience,
        consultationFee: body.consultationFee !== undefined ? parseFloat(body.consultationFee) : doctor.consultationFee,
        location: body.location !== undefined ? body.location : doctor.location,
        languages: body.languages !== undefined ? body.languages : doctor.languages,
        about: body.about !== undefined ? body.about : doctor.about,
      },
    });

    return apiSuccess({
      doctor: updated,
      message: 'Doctor profile updated successfully.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
