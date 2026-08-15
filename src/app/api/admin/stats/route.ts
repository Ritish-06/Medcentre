import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, ForbiddenError, UnauthorizedError } from '@/lib/api/error';
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

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalPharmacies,
      totalMedicines,
      totalOrders,
      ordersAggregate,
      totalPrescriptions,
      totalAppointments,
      recentOrders,
      recentAppointments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.doctorProfile.count(),
      prisma.pharmacy.count(),
      prisma.medicine.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
      }),
      prisma.prescription.count(),
      prisma.appointment.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          pharmacy: { select: { name: true } },
        },
      }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { name: true, email: true } },
          doctor: { select: { name: true, speciality: true } },
        },
      }),
    ]);

    return apiSuccess({
      counts: {
        users: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        pharmacies: totalPharmacies,
        medicines: totalMedicines,
        orders: totalOrders,
        prescriptions: totalPrescriptions,
        appointments: totalAppointments,
        revenue: ordersAggregate._sum.finalAmount || 0,
      },
      recentOrders,
      recentAppointments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
