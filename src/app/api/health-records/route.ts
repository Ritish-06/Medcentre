import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let patientId = sessionUser?.id;

    if (!patientId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
      if (defaultUser) patientId = defaultUser.id;
      else throw new UnauthorizedError('Authentication is required to access health records.', 'UNAUTHORIZED');
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const whereClause: any = { userId: patientId };

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

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let patientId = sessionUser?.id;

    if (!patientId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'PATIENT' } });
      if (defaultUser) patientId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required to upload health records.', 'UNAUTHENTICATED');
    }

    const body = await req.json();
    const {
      title,
      category = 'MEDICAL_DOCUMENTS',
      doctorName,
      recordDate = new Date().toISOString().split('T')[0],
      description,
      fileName,
      fileType = 'application/pdf',
      fileSize = 1024 * 512,
    } = body;

    if (!title || !title.trim()) {
      throw new BadRequestError('Document title is required.', 'MISSING_TITLE');
    }

    const validCategories = ['PRESCRIPTIONS', 'LAB_REPORTS', 'MEDICAL_DOCUMENTS', 'DOCTOR_VISITS'];
    const safeCategory = validCategories.includes(category.toUpperCase())
      ? category.toUpperCase()
      : 'MEDICAL_DOCUMENTS';

    const safeFileName = fileName || `${title.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;

    const record = await prisma.healthRecord.create({
      data: {
        userId: patientId,
        title: title.trim(),
        category: safeCategory,
        fileName: safeFileName,
        fileType,
        fileSize,
        recordDate,
        doctorName: doctorName?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return apiSuccess({ record, message: 'Health record saved successfully.' }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
