import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Return all patients for doctor selection
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess({ patients });
  } catch (error) {
    return handleApiError(error);
  }
}
