import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AcademicClient from './AcademicClient';

export const dynamic = 'force-dynamic';

export default async function AcademicPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [years, subjects, settings] = await Promise.all([
    prisma.academicYear.findMany({
      include: { terms: true },
      orderBy: { name: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AcademicClient
        years={years}
        subjects={subjects}
        settings={settings}
        userRole={user.role}
      />
    </div>
  );
}
