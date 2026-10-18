import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import StudentProfileClient from './StudentProfileClient';

export const dynamic = 'force-dynamic';

interface StudentProfilePageProps {
  params: {
    id: string;
  };
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = params;

  const student = await prisma.student.findFirst({
    where: {
      OR: [{ id: id }, { studentId: id }],
    },
    include: {
      admissionClass: true,
      currentClass: {
        include: {
          feeStructures: {
            include: {
              academicYear: true,
              term: true,
            },
          },
          teachers: {
            select: {
              fullName: true,
              phone: true,
              email: true,
            },
          },
        },
      },
      academicYear: true,
      parents: {
        include: {
          parent: true,
        },
      },
      attendances: {
        orderBy: { date: 'desc' },
        include: {
          class: true,
        },
      },
      results: {
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          academicYear: true,
          term: true,
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        include: {
          feeStructure: true,
        },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
      history: {
        orderBy: { createdAt: 'desc' },
      },
      disciplineRecords: {
        orderBy: { incidentDate: 'desc' },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Calculate Fee Balances
  const totalAssignedFees = student.currentClass.feeStructures.reduce(
    (sum, f) => sum + f.amount,
    0
  );
  const totalAmountPaid = student.payments.reduce(
    (sum, p) => sum + p.amountPaid,
    0
  );
  const outstandingBalance = Math.max(0, totalAssignedFees - totalAmountPaid);

  // Calculate Attendance Stats
  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter((a) => a.status === 'PRESENT').length;
  const lateDays = student.attendances.filter((a) => a.status === 'LATE').length;
  const absentDays = student.attendances.filter((a) => a.status === 'ABSENT').length;
  const excusedDays = student.attendances.filter((a) => a.status === 'EXCUSED').length;
  const attendancePercentage =
    totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 100;

  // Settings
  const settings = await prisma.schoolSettings.findUnique({
    where: { id: 'settings_primary' },
  });

  return (
    <div className="space-y-6">
      <StudentProfileClient
        student={student}
        financials={{
          totalAssignedFees,
          totalAmountPaid,
          outstandingBalance,
        }}
        attendanceStats={{
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          excusedDays,
          attendancePercentage,
        }}
        settings={settings}
        userRole={user.role}
        user={user}
      />
    </div>
  );
}
