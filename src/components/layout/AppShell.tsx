'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SessionUser } from '@/lib/auth';

interface AppShellProps {
  user: SessionUser | null;
  activeYearName?: string;
  activeTermName?: string;
  children: React.ReactNode;
}

export default function AppShell({
  user,
  activeYearName,
  activeTermName,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // If on login page, render children directly without dashboard shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          user={user}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeYearName={activeYearName}
          activeTermName={activeTermName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
