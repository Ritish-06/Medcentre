export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  PHARMACY: 'PHARMACY',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
