import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { handleApiError, UnauthorizedError } from '@/lib/api/error';
import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      throw new UnauthorizedError('No active session token found.', 'NO_SESSION');
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      throw new UnauthorizedError('Session token is invalid or expired.', 'EXPIRED_SESSION');
    }

    return apiSuccess({ user: payload });
  } catch (error) {
    return handleApiError(error);
  }
}
