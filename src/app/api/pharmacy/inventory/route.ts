import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser, Role } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to add inventory items.', 'UNAUTHORIZED');
    }

    if (sessionUser.role !== Role.PHARMACY && sessionUser.role !== Role.ADMIN) {
      throw new ForbiddenError('Only Pharmacies or Administrators can manage inventory.', 'FORBIDDEN_ROLE');
    }

    const body = await req.json();
    const { pharmacyId, medicineId, SKU, batchNumber, expiryDate, quantity, price, MRP } = body;

    if (!pharmacyId || !medicineId || !SKU || !batchNumber || !expiryDate || quantity === undefined || !price || !MRP) {
      throw new BadRequestError('All fields (pharmacyId, medicineId, SKU, batchNumber, expiryDate, quantity, price, MRP) are required.', 'MISSING_FIELDS');
    }

    // OWNERSHIP AUTHORIZATION CHECK
    if (sessionUser.role === Role.PHARMACY) {
      const userPharmacy = await prisma.pharmacy.findUnique({
        where: { userId: sessionUser.id },
      });

      if (!userPharmacy || userPharmacy.id !== pharmacyId) {
        throw new ForbiddenError('You are only authorized to manage your own pharmacy inventory.', 'FORBIDDEN_OWNERSHIP');
      }
    }

    // Verify Medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });
    if (!medicine) {
      throw new BadRequestError('Specified medicine ID does not exist.', 'MEDICINE_NOT_FOUND');
    }

    // Create inventory record
    const inventory = await prisma.medicineInventory.create({
      data: {
        pharmacyId,
        medicineId,
        SKU: SKU.trim(),
        batchNumber: batchNumber.trim(),
        expiryDate: new Date(expiryDate),
        quantity: Math.max(0, parseInt(quantity, 10)),
        price: parseFloat(price),
        MRP: parseFloat(MRP),
      },
      include: {
        medicine: true,
      },
    });

    return apiSuccess({ inventory }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
