import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to access health records.', 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const whereClause: any = { userId: sessionUser.id };

    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }

    const records = await prisma.healthRecord.findMany({
      where: whereClause,
      include: {
        prescription: {
          include: {
            medicines: true,
            doctor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess({
      records,
      totalCount: records.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
