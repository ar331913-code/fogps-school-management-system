'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Users,
  Printer,
} from 'lucide-react';
import { computeGrade } from '@/lib/utils';

interface ResultsClientProps {
  classes: any[];
  subjects: any[];
  academicYears: any[];
  terms: any[];
  initialClassId: string;
  initialSubjectId: string;
  initialYearId: string;
  initialTermId: string;
  userRole: string;
}

export default function ResultsClient({
  classes,
  subjects,
  academicYears,
  terms,
  initialClassId,
  initialSubjectId,
  initialYearId,
  initialTermId,
  userRole,
}: ResultsClientProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [selectedYearId, setSelectedYearId] = useState(initialYearId);
  const [selectedTermId, setSelectedTermId] = useState(initialTermId);

  const [sheet, setSheet] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchScoreSheet = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}&academicYearId=${selectedYearId}&termId=${selectedTermId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load score sheet');
      setSheet(data.sheet || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreSheet();
  }, [selectedClassId, selectedSubjectId, selectedYearId, selectedTermId]);

  const handleScoreChange = (studentId: string, field: 'classScore' | 'examScore' | 'remarks', value: string) => {
    setSheet((prev) =>
      prev.map((r) => {
        if (r.studentId !== studentId) return r;

        const updated = { ...r, [field]: value };
        const cScore = parseFloat(updated.classScore) || 0;
        const eScore = parseFloat(updated.examScore) || 0;
        const total = Math.min(100, Math.round((cScore + eScore) * 10) / 10);
        const { grade, remark } = computeGrade(total);

        updated.totalScore = total;
        updated.grade = updated.classScore !== '' || updated.examScore !== '' ? grade : '—';
        if (field !== 'remarks' && (!updated.remarks || updated.remarks === 'Satisfactory')) {
          updated.remarks = remark;
        }

        return updated;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          academicYearId: selectedYearId,
          termId: selectedTermId,
          records: sheet,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save results');
      setMessage({ type: 'success', text: 'Score sheet saved and student grades recorded successfully!' });
      fetchScoreSheet();
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
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Terminal Results & Marks Entry
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter continuous assessment (30%) and examination scores (70%) with automatic grading
          </p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
          <button
            onClick={handleSave}
            disabled={saving || sheet.length === 0}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Calculating & Saving...' : 'Save & Compute Grades'}</span>
          </button>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
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
            Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Academic Year
          </label>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Term
          </label>
          <select
            value={selectedTermId}
            onChange={(e) => setSelectedTermId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
          >
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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

      {/* Marks Entry Sheet */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Admission ID</th>
                <th className="py-3.5 px-4 w-28">Class Score (Max 30)</th>
                <th className="py-3.5 px-4 w-28">Exam Score (Max 70)</th>
                <th className="py-3.5 px-4 w-24">Total (100%)</th>
                <th className="py-3.5 px-4 w-20">Grade</th>
                <th className="py-3.5 px-4">Subject Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading marks entry sheet...
                  </td>
                </tr>
              ) : sheet.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No students enrolled in this class</p>
                  </td>
                </tr>
              ) : (
                sheet.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.studentName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-700">{r.admissionId}</td>
                    
                    {/* Class Score Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        placeholder="0 - 30"
                        value={r.classScore}
                        onChange={(e) => handleScoreChange(r.studentId, 'classScore', e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/30"
                      />
                    </td>

                    {/* Exam Score Input */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        placeholder="0 - 70"
                        value={r.examScore}
                        onChange={(e) => handleScoreChange(r.studentId, 'examScore', e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/30"
                      />
                    </td>

                    {/* Total Score */}
                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-purple-900 block text-center">
                        {r.totalScore}
                      </span>
                    </td>

                    {/* Grade Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-xs">
                        {r.grade}
                      </span>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="e.g. Excellent comprehension"
                        value={r.remarks}
                        onChange={(e) => handleScoreChange(r.studentId, 'remarks', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:bg-white"
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
