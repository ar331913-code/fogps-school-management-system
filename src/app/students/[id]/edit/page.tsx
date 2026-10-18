import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import EditStudentForm from './EditStudentForm';

export const dynamic = 'force-dynamic';

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN' && user.role !== 'RECEPTIONIST') {
    redirect(`/students/${params.id}`);
  }

  const { id } = params;

  const [student, classes, academicYears] = await Promise.all([
    prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
      include: {
        currentClass: true,
        admissionClass: true,
      },
    }),
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
    prisma.academicYear.findMany({ orderBy: { name: 'desc' } }),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <EditStudentForm
        student={student}
        classes={classes}
        academicYears={academicYears}
      />
    </div>
  );
}
