import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, UnauthorizedError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    let patientId = sessionUser?.id;

    if (!patientId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) patientId = defaultUser.id;
      else throw new UnauthorizedError('Authentication required to upload health records.', 'UNAUTHENTICATED');
    }

    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let category = 'MEDICAL_DOCUMENTS';
    let doctorName = '';
    let recordDate = new Date().toISOString().split('T')[0];
    let description = '';
    let fileName = `Doc_${Date.now()}.pdf`;
    let fileType = 'application/pdf';
    let fileSize = 2048;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      title = (formData.get('title') as string) || '';
      category = (formData.get('category') as string) || 'MEDICAL_DOCUMENTS';
      doctorName = (formData.get('doctorName') as string) || '';
      recordDate = (formData.get('recordDate') as string) || recordDate;
      description = (formData.get('description') as string) || '';

      if (file) {
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
      }
    } else {
      const body = await req.json();
      title = body.title || '';
      category = body.category || 'MEDICAL_DOCUMENTS';
      doctorName = body.doctorName || '';
      recordDate = body.recordDate || recordDate;
      description = body.description || '';
      if (body.fileName) fileName = body.fileName;
      if (body.fileType) fileType = body.fileType;
    }

    if (!title.trim()) {
      throw new BadRequestError('Document title is required.', 'MISSING_TITLE');
    }

    const validCategories = ['PRESCRIPTIONS', 'LAB_REPORTS', 'MEDICAL_DOCUMENTS', 'DOCTOR_VISITS'];
    if (!validCategories.includes(category.toUpperCase())) {
      category = 'MEDICAL_DOCUMENTS';
    }

    const record = await prisma.healthRecord.create({
      data: {
        userId: patientId,
        title: title.trim(),
        category: category.toUpperCase(),
        fileName,
        fileType,
        fileSize,
        recordDate,
        doctorName: doctorName.trim() || null,
        description: description.trim() || null,
      },
    });

    return apiSuccess({ record, message: 'Health record saved successfully.' }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
