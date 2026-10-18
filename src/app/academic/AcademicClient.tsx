'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Radio,
  Book,
} from 'lucide-react';

interface AcademicClientProps {
  years: any[];
  subjects: any[];
  settings: any;
  userRole: string;
}

export default function AcademicClient({
  years,
  subjects,
  settings,
  userRole,
}: AcademicClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'years' | 'subjects'>('years');
  const [newYearName, setNewYearName] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Subject form
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    isCore: true,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSetActiveYear = async (yearId: string) => {
    try {
      const res = await fetch('/api/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_ACTIVE_YEAR', yearId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetActiveTerm = async (termId: string) => {
    try {
      const res = await fetch('/api/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_ACTIVE_TERM', termId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_YEAR', name: newYearName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create academic year');
      setShowYearModal(false);
      setNewYearName('');
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/academic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_SUBJECT', ...subjectForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subject');
      setShowSubjectModal(false);
      setSubjectForm({ name: '', code: '', isCore: true, description: '' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Academic Years, Terms & Subjects
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure active academic sessions, terminal calendars, and subject curricula
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowYearModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              + Add Academic Year
            </button>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('years')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'years'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Academic Years & Terms
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subjects'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Subject Catalog ({subjects.length})
        </button>
      </div>

      {/* TAB 1: Academic Years */}
      {activeTab === 'years' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {years.map((y) => (
              <div
                key={y.id}
                className={`p-6 rounded-3xl border transition-all ${
                  y.isCurrent
                    ? 'bg-sky-50/60 border-sky-300 shadow-sm'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    <h3 className="text-base font-black text-slate-900">{y.name}</h3>
                  </div>
                  {y.isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                      Active School Year
                    </span>
                  ) : (
                    userRole === 'ADMIN' && (
                      <button
                        onClick={() => handleSetActiveYear(y.id)}
                        className="text-xs font-bold text-sky-600 hover:underline"
                      >
                        Set as Active
                      </button>
                    )
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Terms in Session:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {y.terms?.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => userRole === 'ADMIN' && handleSetActiveTerm(t.id)}
                        className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                          t.isCurrent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>{t.name}</div>
                        <div className="text-[9px] font-normal opacity-80 mt-0.5">
                          {t.isCurrent ? 'Current' : 'Select'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Subjects Catalog */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md text-xs border border-sky-100">
                  {s.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.isCore
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {s.isCore ? 'Core Subject' : 'Elective'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {s.description || 'Standard Ghana GES basic school curriculum.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Year Modal */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add Academic Year</h3>
            <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026/2027"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {loading ? 'Creating...' : 'Create Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Add New Curriculum Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics & AI"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ROB"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Type</label>
                  <select
                    value={String(subjectForm.isCore)}
                    onChange={(e) => setSubjectForm({ ...subjectForm, isCore: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="true">Core Subject</option>
                    <option value="false">Elective / Extra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Optional brief description..."
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {loading ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
