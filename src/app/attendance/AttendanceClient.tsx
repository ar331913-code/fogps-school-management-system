'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface AttendanceClientProps {
  classes: any[];
  initialClassId: string;
  userRole: string;
}

export default function AttendanceClient({
  classes,
  initialClassId,
  userRole,
}: AttendanceClientProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, present: 0, late: 0, absent: 0, excused: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAttendance = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/attendance?classId=${selectedClassId}&date=${selectedDate}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load attendance');
      setRecords(data.records || []);
      setSummary(data.summary || { total: 0, present: 0, late: 0, absent: 0, excused: 0 });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleRemarkChange = (studentId: string, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r))
    );
  };

  const markAll = (status: string) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          date: selectedDate,
          records,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance');
      setMessage({ type: 'success', text: 'Attendance register saved successfully!' });
      fetchAttendance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Daily Attendance Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record and monitor student daily attendance and punctuality
          </p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
          <button
            onClick={handleSave}
            disabled={saving || records.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Records...' : 'Save Attendance Register'}</span>
          </button>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => markAll('PRESENT')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition-all"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('ABSENT')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-all"
          >
            Mark All Absent
          </button>
        </div>
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

      {/* Summary KPI Mini-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled in Class</span>
          <span className="text-xl font-black text-slate-900">{records.length}</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
          <span className="text-xl font-black text-emerald-800">
            {records.filter((r) => r.status === 'PRESENT').length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Late</span>
          <span className="text-xl font-black text-amber-800">
            {records.filter((r) => r.status === 'LATE').length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Absent</span>
          <span className="text-xl font-black text-rose-800">
            {records.filter((r) => r.status === 'ABSENT').length}
          </span>
        </div>
      </div>

      {/* Roll Call Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Admission ID</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Attendance Status</th>
                <th className="py-3.5 px-4">Remarks / Excuse Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading class attendance roster...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No students enrolled in this class</p>
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-700">{r.admissionId}</td>
                    <td className="py-3 px-4 text-slate-600">{r.gender}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'LATE')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            r.status === 'LATE'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            r.status === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.studentId, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            r.status === 'EXCUSED'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. sick with doctor note)..."
                        value={r.remarks}
                        onChange={(e) => handleRemarkChange(r.studentId, e.target.value)}
                        className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
