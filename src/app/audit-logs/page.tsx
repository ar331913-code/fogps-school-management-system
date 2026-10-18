import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuditLogClient from './AuditLogClient';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 250,
  });

  const logs = rawLogs.map((log) => ({
    id: log.id,
    userId: log.userId,
    userName: log.userName,
    userRole: log.userRole,
    action: log.action,
    module: log.module,
    recordId: log.recordId,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
  }));

  return <AuditLogClient initialLogs={logs} />;
}
