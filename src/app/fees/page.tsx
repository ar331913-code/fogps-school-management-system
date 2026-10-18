import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FeesClient from './FeesClient';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [students, classes, feeStructures, recentPayments] = await Promise.all([
    prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: {
        currentClass: {
          include: {
            feeStructures: true,
          },
        },
        payments: true,
      },
      orderBy: { firstName: 'asc' },
    }),
    prisma.class.findMany({
      include: { feeStructures: true },
      orderBy: { name: 'asc' },
    }),
    prisma.feeStructure.findMany({
      include: { class: true },
      orderBy: { name: 'asc' },
    }),
    prisma.feePayment.findMany({
      take: 20,
      include: {
        student: {
          include: { currentClass: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Compute student ledger summaries
  const studentLedgers = students.map((s) => {
    const totalAssigned = s.currentClass.feeStructures.reduce(
      (sum, f) => sum + f.amount,
      0
    );
    const totalPaid = s.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const balance = Math.max(0, totalAssigned - totalPaid);

    return {
      id: s.id,
      studentId: s.studentId,
      name: `${s.firstName} ${s.lastName}`,
      className: s.currentClass.name,
      totalAssigned,
      totalPaid,
      balance,
      paymentsCount: s.payments.length,
    };
  });

  return (
    <div className="space-y-6">
      <FeesClient
        ledgers={studentLedgers}
        classes={classes}
        feeStructures={feeStructures}
        recentPayments={recentPayments}
        userRole={user.role}
      />
    </div>
  );
}
