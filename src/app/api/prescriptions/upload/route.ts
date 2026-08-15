import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError } from '@/lib/api/error';
import { validatePrescriptionFile, savePrescriptionFile } from '@/lib/storage';
import { OCRService } from '@/lib/ocr';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('prescriptionFile') as File | null;

    if (!file) {
      throw new BadRequestError('No prescription file uploaded.', 'NO_FILE_UPLOADED');
    }

    // 1. Validate File Format, Extension & 5MB Size
    validatePrescriptionFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 2. Identify active user session or default guest user
    const sessionUser = await getSessionUser();
    let userId = sessionUser?.id;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        throw new BadRequestError('User account context missing.', 'NO_USER_CONTEXT');
      }
    }

    // 3. Store file locally
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { fileUrl, filePath } = await savePrescriptionFile(buffer, file.name);

    // 4. Create Prescription Record
    const prescription = await prisma.prescription.create({
      data: {
        userId,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        status: 'PENDING_VERIFICATION',
      },
    });

    // 5. Execute OCR Service Pipeline
    const ocrProcessing = await OCRService.processPrescription(
      prescription.id,
      buffer,
      file.type,
      file.name
    );

    // 6. Fetch complete prescription with OCR and medicines
    const fullPrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: {
        ocrResult: true,
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
    });

    return apiSuccess({
      prescription: fullPrescription,
      ocrResult: ocrProcessing.ocrResult,
      medicines: ocrProcessing.medicines,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
