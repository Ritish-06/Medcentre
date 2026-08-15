import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, NotFoundError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pharmacyId } = params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all'; // all, in_stock, out_of_stock, expired

    // 1. Verify pharmacy exists
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundError(`Pharmacy with ID '${pharmacyId}' was not found.`, 'PHARMACY_NOT_FOUND');
    }

    // 2. Fetch inventory items with medicine relations
    const rawInventory = await prisma.medicineInventory.findMany({
      where: {
        pharmacyId,
        ...(search && {
          medicine: {
            OR: [
              { name: { contains: search } },
              { brandName: { contains: search } },
              { genericName: { contains: search } },
              { category: { contains: search } },
            ],
          },
        }),
      },
      include: {
        medicine: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // 3. Map items and calculate availability
    const inventory = rawInventory.map((item) => {
      const isExpired = new Date(item.expiryDate) <= now;
      const isOutOfStock = item.quantity <= 0;
      const isAvailable = pharmacy.active && item.quantity > 0 && !isExpired;

      return {
        ...item,
        isExpired,
        isOutOfStock,
        isAvailable, // STRICT: Expired or out-of-stock items are NEVER available
      };
    });

    // 4. Status Filtering
    let filteredInventory = inventory;
    if (status === 'in_stock') {
      filteredInventory = inventory.filter((item) => item.isAvailable);
    } else if (status === 'out_of_stock') {
      filteredInventory = inventory.filter((item) => item.quantity <= 0);
    } else if (status === 'expired') {
      filteredInventory = inventory.filter((item) => item.isExpired);
    }

    return apiSuccess({
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        active: pharmacy.active,
      },
      inventory: filteredInventory,
      stats: {
        totalCount: inventory.length,
        inStockCount: inventory.filter((i) => i.isAvailable).length,
        outOfStockCount: inventory.filter((i) => i.quantity <= 0).length,
        expiredCount: inventory.filter((i) => i.isExpired).length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
