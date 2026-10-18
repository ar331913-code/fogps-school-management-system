import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AttendanceClient from './AttendanceClient';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const classes = await prisma.class.findMany({
    orderBy: { name: 'asc' },
  });

  // Default class selection: Teacher's assigned class or Primary 4 or first class
  const defaultClassId =
    user.teacherClassId ||
    classes.find((c) => c.name === 'Primary 4')?.id ||
    classes[0]?.id ||
    '';

  return (
    <div className="space-y-6">
      <AttendanceClient
        classes={classes}
        initialClassId={defaultClassId}
        userRole={user.role}
      />
    </div>
  );
}
