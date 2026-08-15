import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, BadRequestError } from '@/lib/api/error';
import { AvailabilityEngine } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicineId = searchParams.get('medicineId');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');

    if (!medicineId) {
      throw new BadRequestError('medicineId query parameter is required.', 'MISSING_MEDICINE_ID');
    }

    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;

    const result = await AvailabilityEngine.findPharmaciesForMedicine(
      medicineId,
      userLat,
      userLng
    );

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
