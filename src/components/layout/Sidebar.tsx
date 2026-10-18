'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  Receipt,
  FileText,
  Settings,
  ShieldCheck,
  History,
  IdCard,
  LogOut,
  ChevronRight,
  School,
} from 'lucide-react';
import { SessionUser } from '@/lib/auth';

interface SidebarProps {
  user: SessionUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const role = user?.role || 'TEACHER';

  const isCurrent = (href: string) => {
    if (href === '/dashboard' || href === '/') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST'],
    },
    {
      header: 'STUDENT MANAGEMENT',
      roles: ['ADMIN', 'TEACHER', 'RECEPTIONIST'],
    },
    {
      label: 'Student Directory',
      href: '/students',
      icon: Users,
      roles: ['ADMIN', 'TEACHER', 'RECEPTIONIST'],
    },
    {
      label: 'Register Student',
      href: '/students/register',
      icon: UserPlus,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      header: 'ACADEMICS',
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'Classes & Roster',
      href: '/classes',
      icon: GraduationCap,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'Academic Years & Terms',
      href: '/academic',
      icon: BookOpen,
      roles: ['ADMIN'],
    },
    {
      label: 'Daily Attendance',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      label: 'Terminal Results',
      href: '/results',
      icon: Award,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      header: 'FINANCE & BURSARY',
      roles: ['ADMIN', 'ACCOUNTANT'],
    },
    {
      label: 'School Fees & Ledgers',
      href: '/fees',
      icon: CreditCard,
      roles: ['ADMIN', 'ACCOUNTANT'],
    },
    {
      label: 'Fee Structures',
      href: '/fees/structures',
      icon: Receipt,
      roles: ['ADMIN', 'ACCOUNTANT'],
    },
    {
      header: 'REPORTS & TOOLS',
      roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST'],
    },
    {
      label: 'Reports Center',
      href: '/reports',
      icon: FileText,
      roles: ['ADMIN', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST'],
    },
    {
      header: 'ADMINISTRATION',
      roles: ['ADMIN'],
    },
    {
      label: 'School Settings',
      href: '/settings',
      icon: Settings,
      roles: ['ADMIN'],
    },
    {
      label: 'Staff User Accounts',
      href: '/users',
      icon: ShieldCheck,
      roles: ['ADMIN'],
    },
    {
      label: 'Audit Trail Logs',
      href: '/audit-logs',
      icon: History,
      roles: ['ADMIN'],
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-sky-400 truncate">
              Full of Grace Prep
            </span>
            <span className="text-sm font-bold text-white truncate">
              School System
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-bold text-sky-300 text-xs shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-100 truncate">
                {user?.fullName || 'Staff User'}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-sky-400">
                {user?.role || 'TEACHER'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item, idx) => {
            if ('header' in item) {
              if (!item.roles.includes(role)) return null;
              return (
                <div
                  key={`header-${idx}`}
                  className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {item.header}
                </div>
              );
            }

            if (!item.roles.includes(role)) return null;

            const active = isCurrent(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
