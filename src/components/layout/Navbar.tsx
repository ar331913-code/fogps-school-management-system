'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Search,
  Calendar,
  Sparkles,
  ChevronDown,
  UserCheck,
  Shield,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { SessionUser } from '@/lib/auth';

interface NavbarProps {
  user: SessionUser | null;
  onMenuToggle: () => void;
  activeYearName?: string;
  activeTermName?: string;
}

export default function Navbar({
  user,
  onMenuToggle,
  activeYearName = '2025/2026',
  activeTermName = 'Second Term',
}: NavbarProps) {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickRoleSwitch = async (username: string) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/students?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs no-print">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              FULL OF GRACE PREPARATORY SCHOOL
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              School Management & Academic Information System
            </p>
          </div>
        </div>

        {/* Center: Quick Search Form */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quick search by Student ID, name, parent or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </form>
        </div>

        {/* Right: Active Session & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Academic Term Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-[11px] font-semibold text-sky-700">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{activeYearName}</span>
            <span className="text-sky-300">•</span>
            <span>{activeTermName}</span>
          </div>

          {/* Quick Role Switcher Dropdown (Fast testing utility) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all shadow-2xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-900">
                {user?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-800">Switch Role View</p>
                  <p className="text-[10px] text-slate-400">
                    Switch instant access between configured accounts
                  </p>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleQuickRoleSwitch('admin');
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      user?.role === 'ADMIN'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="font-medium">Administrator</div>
                      <div className="text-[10px] text-slate-400">Full System Control</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickRoleSwitch('teacher');
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      user?.role === 'TEACHER'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-medium">Teacher (Primary 4)</div>
                      <div className="text-[10px] text-slate-400">Attendance & Results</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickRoleSwitch('accountant');
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      user?.role === 'ACCOUNTANT'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-medium">Accountant / Bursar</div>
                      <div className="text-[10px] text-slate-400">Fees & Receipts</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleQuickRoleSwitch('receptionist');
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      user?.role === 'RECEPTIONIST'
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-medium">Receptionist</div>
                      <div className="text-[10px] text-slate-400">Admissions & Search</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
