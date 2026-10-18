'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  School,
  Lock,
  User,
  Shield,
  UserCheck,
  CreditCard,
  UserPlus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Brand Panel */}
        <div className="bg-gradient-to-br from-sky-700 via-sky-800 to-blue-900 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-inner">
              <School className="w-8 h-8 text-sky-200" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white mb-2">
              FULL OF GRACE PREPARATORY SCHOOL
            </h1>
            <p className="text-sky-200 text-xs font-medium uppercase tracking-widest mb-6">
              Excellence, Discipline & Grace
            </p>
            <p className="text-sky-100/80 text-sm leading-relaxed">
              Welcome to the official School Management System. Access student records, attendance, terminal grading, and fee ledgers securely.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-xs text-sky-200/70 flex items-center justify-between">
            <span>Accra, Ghana</span>
            <span>Academic Year 2025/2026</span>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Switchers */}
        <div className="p-8 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Staff Portal Login</h2>
            <p className="text-xs text-slate-500 mb-6">
              Enter your staff credentials to access your dashboard
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or teacher"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Role Demo Access (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 group-hover:text-sky-700 font-bold text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Admin</span>
                </div>
                <div className="text-[9px] text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher', 'teacher123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 group-hover:text-emerald-700 font-bold text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Teacher</span>
                </div>
                <div className="text-[9px] text-slate-400">teacher / teacher123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('accountant', 'accountant123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 group-hover:text-amber-700 font-bold text-[11px]">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>Accountant</span>
                </div>
                <div className="text-[9px] text-slate-400">accountant / accountant123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist', 'receptionist123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 group-hover:text-purple-700 font-bold text-[11px]">
                  <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                  <span>Receptionist</span>
                </div>
                <div className="text-[9px] text-slate-400">receptionist / receptionist123</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
