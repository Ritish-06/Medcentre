import fs from 'fs';
import path from 'path';
import { BadRequestError } from './api/error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export interface StorageValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

export function validatePrescriptionFile(file: {
  name: string;
  type: string;
  size: number;
}): void {
  const ext = path.extname(file.name).toLowerCase();

  // 1. Validate File Size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestError(
      `File size exceeds maximum limit of 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      'INVALID_FILE_SIZE'
    );
  }

  // 2. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new BadRequestError(
      `Unsupported file type '${file.type}'. Allowed formats are JPG, JPEG, PNG, and PDF.`,
      'INVALID_MIME_TYPE'
    );
  }

  // 3. Validate Extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new BadRequestError(
      `Unsupported file extension '${ext}'. Allowed extensions are .jpg, .jpeg, .png, .pdf.`,
      'INVALID_EXTENSION'
    );
  }
}

export async function savePrescriptionFile(
  buffer: Buffer,
  originalFilename: string
): Promise<{ fileUrl: string; filePath: string }> {
  const ext = path.extname(originalFilename).toLowerCase();
  const uniqueId = Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  const safeFilename = `prescription_${uniqueId}${ext}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions');

  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, safeFilename);
  await fs.promises.writeFile(filePath, buffer);

  const fileUrl = `/uploads/prescriptions/${safeFilename}`;
  return { fileUrl, filePath };
}
