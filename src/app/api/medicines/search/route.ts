import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || searchParams.get('query')?.trim() || '';

    if (!query) {
      const medicines = await prisma.medicine.findMany({
        take: 10,
        orderBy: { name: 'asc' },
      });
      return apiSuccess({ medicines });
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { genericName: { contains: query } },
          { brandName: { contains: query } },
          { category: { contains: query } },
          { activeIngredients: { contains: query } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    return apiSuccess({ medicines, query });
  } catch (error) {
    return handleApiError(error);
  }
}
