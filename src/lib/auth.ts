import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import { cookies } from 'next/headers';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  PHARMACY = 'PHARMACY',
  ADMIN = 'ADMIN',
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medcentre_secret_jwt_key_2026_super_secure'
);

export const COOKIE_NAME = 'medcentre_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<UserPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getRedirectPathForRole(role: string): string {
  switch (role) {
    case Role.DOCTOR:
      return '/doctor/dashboard';
    case Role.PHARMACY:
      return '/pharmacy/dashboard';
    case Role.ADMIN:
      return '/admin/dashboard';
    case Role.PATIENT:
    default:
      return '/dashboard';
  }
}
