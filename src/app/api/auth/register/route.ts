import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { handleApiError, BadRequestError } from '@/lib/api/error';
import { hashPassword, signSessionToken, COOKIE_NAME, getRedirectPathForRole, Role } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, confirmPassword, role } = body;

    // 1. Validation checks
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new BadRequestError('Full name must be at least 2 characters long.', 'INVALID_NAME');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestError('A valid email address is required.', 'INVALID_EMAIL');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long.', 'INVALID_PASSWORD');
    }

    if (password !== confirmPassword) {
      throw new BadRequestError('Password and Confirm Password do not match.', 'PASSWORD_MISMATCH');
    }

    const requestedRole = (role || Role.PATIENT).toUpperCase();

    // PUBLIC ADMIN REGISTRATION STRICTLY FORBIDDEN
    if (requestedRole === Role.ADMIN) {
      throw new BadRequestError('Public registration as ADMIN is not permitted.', 'ADMIN_REGISTRATION_FORBIDDEN');
    }

    if (![Role.PATIENT, Role.DOCTOR, Role.PHARMACY].includes(requestedRole as Role)) {
      throw new BadRequestError('Invalid role specified.', 'INVALID_ROLE');
    }

    // 2. Uniqueness check
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new BadRequestError('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
    }

    // 3. Create user in database
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: requestedRole,
      },
    });

    // 4. Create persistent session token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    };

    const token = await signSessionToken(tokenPayload);
    const redirectTo = getRedirectPathForRole(user.role);

    // 5. Response with HTTP-Only Cookie
    const response = apiSuccess({
      user: tokenPayload,
      redirectTo,
    }, 201);

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
