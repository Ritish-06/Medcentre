import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError } from '@/lib/api/error';
import { AvailabilityEngine } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prescriptionId = searchParams.get('prescriptionId');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!prescriptionId) {
      throw new BadRequestError('prescriptionId query parameter is required.', 'MISSING_PRESCRIPTION_ID');
    }

    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;

    const result = await AvailabilityEngine.findPharmaciesForPrescription(
      prescriptionId,
      userLat,
      userLng
    );

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
