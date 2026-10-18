import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [classes, settings] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.schoolSettings.findUnique({ where: { id: 'settings_primary' } }),
  ]);

  return (
    <div className="space-y-6">
      <ReportsClient classes={classes} settings={settings} userRole={user.role} />
    </div>
  );
}
