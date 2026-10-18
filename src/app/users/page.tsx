import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [users, classes] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        teacherClassId: true,
        assignedClass: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.class.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <UsersClient users={users} classes={classes} />
    </div>
  );
}
