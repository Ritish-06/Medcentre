import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const pharmacies = await prisma.pharmacy.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        openingHours: true,
        deliveryAvailable: true,
        pickupAvailable: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess({ pharmacies });
  } catch (error) {
    return handleApiError(error);
  }
}
