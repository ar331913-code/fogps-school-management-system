import { prisma } from './prisma';

export interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT' | 'PAYMENT';
  module: 'Students' | 'Classes' | 'Fees' | 'Results' | 'Attendance' | 'Settings' | 'Auth' | 'Documents';
  recordId?: string | null;
  details: string;
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        module: params.module,
        recordId: params.recordId,
        details: params.details,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
