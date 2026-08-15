import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/response';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const response = apiSuccess({ message: 'Session logged out successfully' });

  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
