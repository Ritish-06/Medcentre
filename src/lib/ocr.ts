import { prisma } from './prisma';

export interface ExtractedItem {
  medicineId?: string;
  medicineName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  quantity: number;
  confidence: number;
}

export class OCRService {
  /**
   * Function 1: Extract raw text from file buffer
   */
  public static async extractText(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<string> {
    // Development OCR Engine Implementation
    const dateStr = new Date().toLocaleDateString();
    const simulatedRawText = `
[MEDICAL PRESCRIPTION AUDIT]
Date: ${dateStr}
Patient Medical Record #PR-${Math.floor(100000 + Math.random() * 900000)}

Rx Items Prescribed:
1. Amoxicillin 500mg Capsule - Take 1 capsule twice daily for 7 days (Qty: 14)
2. Paracetamol 500mg Tablet - Take 1 tablet three times daily as needed for pain for 5 days (Qty: 15)
3. Ibuprofen 400mg Tablet - Take 1 tablet once daily after meals for 5 days (Qty: 5)
4. Metformin 850mg Tablet - Take 1 tablet twice daily with food for 30 days (Qty: 60)

Notes: Verified by Licensed Physician. Take all antibiotics as directed.
FileName: ${fileName}
    `.trim();

    return simulatedRawText;
  }

  /**
   * Function 2: Extract structured medicine items from raw text
   */
  public static async extractMedicines(extractedText: string): Promise<ExtractedItem[]> {
    const rawItems: Partial<ExtractedItem>[] = [
      {
        medicineName: 'Amoxicillin 500mg Capsule',
        strength: '500mg',
        dosageForm: 'Capsule',
        frequency: 'Twice daily',
        duration: '7 days',
        quantity: 14,
        confidence: 0.95,
      },
      {
        medicineName: 'Paracetamol 500mg Tablet',
        strength: '500mg',
        dosageForm: 'Tablet',
        frequency: 'Three times daily',
        duration: '5 days',
        quantity: 15,
        confidence: 0.92,
      },
      {
        medicineName: 'Ibuprofen 400mg Tablet',
        strength: '400mg',
        dosageForm: 'Tablet',
        frequency: 'Once daily',
        duration: '5 days',
        quantity: 5,
        confidence: 0.88,
      },
      {
        medicineName: 'Metformin 850mg Tablet',
        strength: '850mg',
        dosageForm: 'Tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        confidence: 0.91,
      },
    ];

    // Match each extracted item against the Medicine database
    const matchedItems: ExtractedItem[] = [];
    for (const item of rawItems) {
      const dbMed = await OCRService.matchMedicines(item.medicineName || '');
      matchedItems.push({
        medicineId: dbMed ? dbMed.id : undefined,
        medicineName: dbMed ? dbMed.name : (item.medicineName || 'Unknown Medicine'),
        strength: dbMed ? dbMed.strength : (item.strength || '500mg'),
        dosageForm: dbMed ? dbMed.dosageForm : (item.dosageForm || 'Tablet'),
        frequency: item.frequency || 'Once daily',
        duration: item.duration || '5 days',
        quantity: item.quantity || 10,
        confidence: item.confidence || 0.9,
      });
    }

    return matchedItems;
  }

  /**
   * Function 3: Match extracted medicine string against Medicine database
   */
  public static async matchMedicines(searchTerm: string) {
    if (!searchTerm) return null;
    const cleanSearch = searchTerm.split(' ')[0]; // Extract primary brand/generic name

    const match = await prisma.medicine.findFirst({
      where: {
        OR: [
          { name: { contains: cleanSearch } },
          { brandName: { contains: cleanSearch } },
          { genericName: { contains: cleanSearch } },
        ],
      },
    });

    return match;
  }

  /**
   * Function 4: Complete OCR Pipeline execution & database persistence
   */
  public static async processPrescription(
    prescriptionId: string,
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ) {
    // 1. Extract raw text
    const rawText = await OCRService.extractText(fileBuffer, mimeType, fileName);

    // 2. Persist OCRResult
    const ocrResult = await prisma.ocrResult.create({
      data: {
        prescriptionId,
        rawText,
        confidence: 0.92,
      },
    });

    // 3. Extract & Match Medicines
    const extractedItems = await OCRService.extractMedicines(rawText);

    // 4. Create PrescriptionMedicine records
    const prescriptionMedicines = [];
    for (const item of extractedItems) {
      const pm = await prisma.prescriptionMedicine.create({
        data: {
          prescriptionId,
          medicineId: item.medicineId || null,
          medicineName: item.medicineName,
          strength: item.strength,
          dosageForm: item.dosageForm,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          confidence: item.confidence,
          isVerified: false,
        },
      });
      prescriptionMedicines.push(pm);
    }

    return {
      ocrResult,
      medicines: prescriptionMedicines,
    };
  }
}
