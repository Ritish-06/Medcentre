import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const speciality = searchParams.get('speciality') || '';
    const location = searchParams.get('location') || '';
    const maxFeeParam = searchParams.get('maxFee');

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { speciality: { contains: q } },
        { location: { contains: q } },
        { qualification: { contains: q } },
        { about: { contains: q } },
      ];
    }

    if (speciality && speciality !== 'ALL') {
      whereClause.speciality = { contains: speciality };
    }

    if (location) {
      whereClause.location = { contains: location };
    }

    if (maxFeeParam) {
      const maxFee = parseFloat(maxFeeParam);
      if (!isNaN(maxFee)) {
        whereClause.consultationFee = { lte: maxFee };
      }
    }

    const doctors = await prisma.doctorProfile.findMany({
      where: whereClause,
      orderBy: { experience: 'desc' },
    });

    // Get distinct specialities
    const allDoctors = await prisma.doctorProfile.findMany({
      select: { speciality: true },
    });
    const specialities = Array.from(new Set(allDoctors.map((d) => d.speciality))).sort();

    return apiSuccess({
      doctors,
      specialities,
      totalCount: doctors.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
