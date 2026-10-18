import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ResultsClient from './ResultsClient';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [classes, subjects, academicYears, terms, settings] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.subject.findMany({ orderBy: { name: 'asc' } }),
    prisma.academicYear.findMany({ orderBy: { name: 'desc' } }),
    prisma.term.findMany({ orderBy: { name: 'asc' } }),
    prisma.schoolSettings.findUnique({ where: { id: 'settings_primary' } }),
  ]);

  const defaultClassId =
    user.teacherClassId ||
    classes.find((c) => c.name === 'Primary 4')?.id ||
    classes[0]?.id ||
    '';

  const defaultSubjectId = subjects[0]?.id || '';
  const defaultYearId = settings?.currentAcademicYearId || academicYears[0]?.id || '';
  const defaultTermId = settings?.currentTermId || terms[0]?.id || '';

  return (
    <div className="space-y-6">
      <ResultsClient
        classes={classes}
        subjects={subjects}
        academicYears={academicYears}
        terms={terms}
        initialClassId={defaultClassId}
        initialSubjectId={defaultSubjectId}
        initialYearId={defaultYearId}
        initialTermId={defaultTermId}
        userRole={user.role}
      />
    </div>
  );
}
