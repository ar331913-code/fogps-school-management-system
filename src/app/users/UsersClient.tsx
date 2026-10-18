'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Plus,
  Shield,
  UserCheck,
  CreditCard,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UsersClientProps {
  users: any[];
  classes: any[];
}

export default function UsersClient({ users, classes }: UsersClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    teacherClassId: classes[0]?.id || '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setShowModal(false);
      setForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        teacherClassId: classes[0]?.id || '',
      });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-indigo-600" />;
      case 'TEACHER':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'ACCOUNTANT':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'RECEPTIONIST':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Staff User Accounts & Access Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized staff accounts across the 4 roles: Admin, Teacher, Accountant, and Receptionist
          </p>
        </div>

        <button
          onClick={() => {
            setMessage(null);
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {getRoleIcon(u.role)}
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">
                    {u.role}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{u.fullName}</h3>
              <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-sky-100">
                @{u.username}
              </span>

              {u.assignedClass && (
                <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                  Assigned: {u.assignedClass.name}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{u.email || 'No email on file'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{u.phone || 'No phone on file'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Staff User Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Samuel Mensah"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. samuelm"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="TEACHER">TEACHER (Class, Attendance & Results)</option>
                  <option value="ACCOUNTANT">ACCOUNTANT (Fees, Payments & Receipts)</option>
                  <option value="RECEPTIONIST">RECEPTIONIST (Student Registration & Search)</option>
                </select>
              </div>

              {form.role === 'TEACHER' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Class</label>
                  <select
                    value={form.teacherClassId}
                    onChange={(e) => setForm({ ...form, teacherClassId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="">None / Unassigned</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
