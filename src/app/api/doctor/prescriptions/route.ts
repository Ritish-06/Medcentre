import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/api/error';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError('Authentication is required to issue prescriptions.', 'UNAUTHORIZED');
    }

    if (sessionUser.role !== 'DOCTOR' && sessionUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only licensed doctors can issue digital prescriptions.', 'FORBIDDEN_ROLE');
    }

    let doctorProfile = null;

    if (sessionUser.role === 'DOCTOR') {
      doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: sessionUser.id },
      });
    } else if (sessionUser.role === 'ADMIN') {
      doctorProfile = await prisma.doctorProfile.findFirst();
    }

    if (!doctorProfile) {
      throw new ForbiddenError('Doctor profile required to issue digital prescriptions.', 'DOCTOR_NOT_FOUND');
    }

    const body = await req.json();
    const { patientId, medicines, clinicalNotes } = body;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      throw new BadRequestError(
        'patientId and at least one medicine item are required.',
        'MISSING_PRESCRIPTION_DATA'
      );
    }

    // 1. Verify Patient exists
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundError(`Patient with ID '${patientId}' not found.`, 'PATIENT_NOT_FOUND');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `Digital_Rx_${doctorProfile.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    // 2. Transactionally Create Prescription, Medicines, and Health Record
    const result = await prisma.$transaction(async (tx) => {
      // a. Create Prescription
      const prescription = await tx.prescription.create({
        data: {
          userId: patientId,
          doctorId: doctorProfile.id,
          fileName,
          fileType: 'DIGITAL',
          fileSize: 1024,
          status: 'VERIFIED',
          verifiedAt: new Date(),
          notes: clinicalNotes || null,
        },
      });

      // b. Create PrescriptionMedicine items
      for (const med of medicines) {
        // Try linking to database Medicine if matched
        const dbMedicine = await tx.medicine.findFirst({
          where: {
            OR: [
              { name: { contains: med.medicineName } },
              { genericName: { contains: med.medicineName } },
              { brandName: { contains: med.medicineName } },
            ],
          },
        });

        const medName = med.medicineName || med.name || 'Prescribed Medicine';
        await tx.prescriptionMedicine.create({
          data: {
            prescriptionId: prescription.id,
            medicineId: dbMedicine ? dbMedicine.id : null,
            medicineName: medName,
            strength: med.strength || '500mg',
            dosageForm: med.dosageForm || 'Tablet',
            frequency: med.frequency || 'Twice daily',
            duration: med.duration || '7 days',
            quantity: med.quantity ? parseInt(med.quantity, 10) : 14,
            confidence: 1.0, // 100% verified by doctor
            isVerified: true,
          },
        });
      }

      // c. Create corresponding HealthRecord entry
      const healthRecord = await tx.healthRecord.create({
        data: {
          userId: patientId,
          title: `Digital Prescription — ${doctorProfile.speciality} (${doctorProfile.name})`,
          category: 'PRESCRIPTIONS',
          fileName,
          fileType: 'DIGITAL',
          fileSize: 1024,
          recordDate: todayStr,
          doctorName: doctorProfile.name,
          description: clinicalNotes || `Prescription issued by ${doctorProfile.name} on ${todayStr}`,
          prescriptionId: prescription.id,
        },
      });

      return { prescription, healthRecord };
    });

    // 3. Fetch full prescription with medicines
    const fullPrescription = await prisma.prescription.findUnique({
      where: { id: result.prescription.id },
      include: {
        medicines: {
          include: { medicine: true },
        },
        doctor: true,
      },
    });

    return apiSuccess({
      prescription: fullPrescription,
      healthRecord: result.healthRecord,
      message: 'Digital prescription issued and stored to patient health records.',
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
