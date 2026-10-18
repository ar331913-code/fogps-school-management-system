import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClassesClient from './ClassesClient';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      include: {
        teachers: true,
        students: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            gender: true,
            status: true,
            phone: true,
          },
          orderBy: { firstName: 'asc' },
        },
        _count: {
          select: {
            students: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'TEACHER', isActive: true },
      select: { id: true, fullName: true, username: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <ClassesClient
        classes={classes}
        teachers={teachers}
        userRole={user.role}
      />
    </div>
  );
}
