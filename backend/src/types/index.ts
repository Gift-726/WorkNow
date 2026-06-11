// WorkNow – Shared TypeScript types
// Source of truth: docs/07_DATABASE_SCHEMA.md

export type UserRole = 'WORKER' | 'EMPLOYER' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  nin?: string;
  bvn?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
