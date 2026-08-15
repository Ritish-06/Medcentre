import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, ForbiddenError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }
    if (sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN_ADMIN_ACCESS');
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { genericName: { contains: q } },
        { brandName: { contains: q } },
        { manufacturer: { contains: q } },
      ];
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    const medicines = await prisma.medicine.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            inventories: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess({
      medicines,
      totalCount: medicines.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required.', 'UNAUTHORIZED');
    }
    if (sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required.', 'FORBIDDEN_ADMIN_ACCESS');
    }

    const body = await req.json();
    const {
      name,
      genericName,
      brandName,
      strength,
      dosageForm = 'Tablet',
      category,
      manufacturer,
      prescriptionRequired = false,
      activeIngredients,
    } = body;

    if (!name || !genericName || !brandName || !strength || !category || !manufacturer) {
      throw new BadRequestError(
        'name, genericName, brandName, strength, category, and manufacturer are required.',
        'MISSING_MEDICINE_FIELDS'
      );
    }

    const medicine = await prisma.medicine.create({
      data: {
        name: name.trim(),
        genericName: genericName.trim(),
        brandName: brandName.trim(),
        strength: strength.trim(),
        dosageForm: dosageForm.trim(),
        category: category.trim(),
        manufacturer: manufacturer.trim(),
        prescriptionRequired: Boolean(prescriptionRequired),
        activeIngredients: activeIngredients ? activeIngredients.trim() : `${genericName} ${strength}`,
      },
    });

    return apiSuccess({ medicine, message: 'Medicine added successfully.' }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
