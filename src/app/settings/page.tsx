import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const settings = await prisma.schoolSettings.findUnique({
    where: { id: 'settings_primary' },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SettingsClient settings={settings} />
    </div>
  );
}
