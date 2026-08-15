import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || searchParams.get('q'))?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const strength = searchParams.get('strength')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '8', 10)));
    const skip = (page - 1) * limit;

    // Construct filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { brandName: { contains: search } },
        { category: { contains: search } },
        { activeIngredients: { contains: search } },
      ];
    }

    if (category) {
      where.category = { equals: category };
    }

    if (strength) {
      where.strength = { equals: strength };
    }

    // Execute queries
    const [medicines, totalCount] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.medicine.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return apiSuccess({
      medicines,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
