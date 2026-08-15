import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'medcentre_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medcentre_secret_jwt_key_2026_super_secure'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Route Categorization
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isPharmacyConsoleRoute =
    pathname === '/pharmacy/dashboard' ||
    pathname.startsWith('/pharmacy/dashboard/') ||
    pathname.startsWith('/pharmacy/orders') ||
    pathname.startsWith('/pharmacy/inventory');
  const isDoctorConsoleRoute =
    pathname === '/doctor/dashboard' || pathname.startsWith('/doctor/dashboard/');
  const isPatientProtected =
    pathname === '/dashboard' ||
    pathname.startsWith('/patient') ||
    pathname === '/appointments' ||
    pathname.startsWith('/appointments/') ||
    pathname === '/health-records' ||
    pathname.startsWith('/health-records/') ||
    pathname === '/reminders' ||
    pathname.startsWith('/reminders/') ||
    pathname === '/cart' ||
    pathname === '/checkout' ||
    pathname === '/orders' ||
    pathname.startsWith('/orders/');

  const isProtectedRoute =
    isAdminRoute || isPharmacyConsoleRoute || isDoctorConsoleRoute || isPatientProtected;

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = (payload as { role?: string }).role;

    // 1. Admin Route Guard
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // 2. Pharmacy Console Guard
    if (isPharmacyConsoleRoute && userRole !== 'PHARMACY' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // 3. Doctor Console Guard
    if (isDoctorConsoleRoute && userRole !== 'DOCTOR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // 4. Patient Protected Route Guard
    if (isPatientProtected && !userRole) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (err) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/patient/:path*',
    '/doctor/dashboard/:path*',
    '/pharmacy/dashboard/:path*',
    '/pharmacy/orders/:path*',
    '/pharmacy/inventory/:path*',
    '/admin/:path*',
    '/appointments/:path*',
    '/health-records/:path*',
    '/reminders/:path*',
    '/cart',
    '/checkout',
    '/orders/:path*',
  ],
};
