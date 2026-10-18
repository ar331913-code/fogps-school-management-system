import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  username: string;
  email?: string | null;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'ACCOUNTANT' | 'RECEPTIONIST';
  teacherClassId?: string | null;
}

const SESSION_COOKIE_NAME = 'fogps_session';

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }

    // Decode session payload
    const parsed = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!parsed?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        teacherClassId: true,
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role as SessionUser['role'],
      teacherClassId: user.teacherClassId,
    };
  } catch {
    return null;
  }
}

export function createSessionCookieValue(user: SessionUser): string {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
}

export const ROLE_PERMISSIONS = {
  ADMIN: {
    canManageStudents: true,
    canEditStudents: true,
    canDeleteStudents: true,
    canManageClasses: true,
    canManageAcademic: true,
    canTakeAttendance: true,
    canEnterResults: true,
    canManageFees: true,
    canRecordPayments: true,
    canViewFinancialReports: true,
    canManageSettings: true,
    canManageUsers: true,
    canViewAuditLogs: true,
    canPrintReports: true,
    canUploadDocuments: true,
  },
  TEACHER: {
    canManageStudents: false,
    canEditStudents: false,
    canDeleteStudents: false,
    canManageClasses: false,
    canManageAcademic: false,
    canTakeAttendance: true,
    canEnterResults: true,
    canManageFees: false,
    canRecordPayments: false,
    canViewFinancialReports: false,
    canManageSettings: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canPrintReports: true,
    canUploadDocuments: true,
  },
  ACCOUNTANT: {
    canManageStudents: false,
    canEditStudents: false,
    canDeleteStudents: false,
    canManageClasses: false,
    canManageAcademic: false,
    canTakeAttendance: false,
    canEnterResults: false,
    canManageFees: true,
    canRecordPayments: true,
    canViewFinancialReports: true,
    canManageSettings: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canPrintReports: true,
    canUploadDocuments: false,
  },
  RECEPTIONIST: {
    canManageStudents: true,
    canEditStudents: true,
    canDeleteStudents: false,
    canManageClasses: false,
    canManageAcademic: false,
    canTakeAttendance: false,
    canEnterResults: false,
    canManageFees: false,
    canRecordPayments: false,
    canViewFinancialReports: false,
    canManageSettings: false,
    canManageUsers: false,
    canViewAuditLogs: false,
    canPrintReports: true,
    canUploadDocuments: true,
  },
};
