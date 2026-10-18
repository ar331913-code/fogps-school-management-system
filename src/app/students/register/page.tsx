import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterStudentPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Permission check: Admin or Receptionist
  if (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST') {
    redirect('/students');
  }

  // Fetch classes, academic years, and settings for ID prefix
  const [classes, academicYears, settings] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.academicYear.findMany({ orderBy: { name: 'desc' } }),
    prisma.schoolSettings.findUnique({ where: { id: 'settings_primary' } }),
  ]);

  const currentYear = new Date().getFullYear();
  const nextSeq = settings?.nextIdNumber || 1;
  const suggestedId = `${settings?.idPrefix || 'FOGPS'}-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <RegisterForm
        classes={classes}
        academicYears={academicYears}
        suggestedId={suggestedId}
      />
    </div>
  );
}
