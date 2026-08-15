import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { handleApiError, UnauthorizedError, BadRequestError } from '@/lib/api/error';
import { verifyPassword, signSessionToken, COOKIE_NAME, getRedirectPathForRole, Role } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required credentials.', 'MISSING_CREDENTIALS');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email address or password.', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email address or password.', 'INVALID_CREDENTIALS');
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
    };

    const token = await signSessionToken(tokenPayload);
    const redirectTo = getRedirectPathForRole(user.role);

    const response = apiSuccess({
      user: tokenPayload,
      redirectTo,
    });

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
