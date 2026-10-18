'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  School,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
  Award,
} from 'lucide-react';

interface SettingsClientProps {
  settings: any;
}

export default function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: settings?.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL',
    motto: settings?.motto || 'Excellence, Discipline and Grace',
    address: settings?.address || 'P.O. Box 123, Spintex Road, Accra, Ghana',
    digitalAddress: settings?.digitalAddress || 'GR-492-3021',
    phone: settings?.phone || '+233 24 412 3456',
    email: settings?.email || 'info@fullofgraceprep.edu.gh',
    website: settings?.website || 'https://fullofgraceprep.edu.gh',
    idPrefix: settings?.idPrefix || 'FOGPS',
    receiptPrefix: settings?.receiptPrefix || 'REC-2026',
    gradingScheme:
      settings?.gradingScheme ||
      'A1:80-100:Excellent,B2:70-79:Very Good,B3:60-69:Good,C4:55-59:Credit,C5:50-54:Credit,C6:45-49:Pass,D7:40-44:Pass,E8:35-39:Weak Pass,F9:0-34:Fail',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setMessage({ type: 'success', text: 'School profile and settings saved successfully!' });
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Settings className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              School Profile & System Settings
            </h1>
            <p className="text-xs text-sky-200">
              Configure institution information, ID formats, receipts, and grading scales
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
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

        {/* Section 1: Institution Details */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-sky-600" />
            <span>1. School Official Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Motto</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal / Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghana Digital Address (GPS)</label>
              <input
                type="text"
                value={formData.digitalAddress}
                onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Identification & Receipt Formats */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Hash className="w-4 h-4 text-sky-600" />
            <span>2. Auto Numbering & ID Formats</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student ID Prefix</label>
              <input
                type="text"
                value={formData.idPrefix}
                onChange={(e) => setFormData({ ...formData, idPrefix: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sky-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Example output: {formData.idPrefix}-2026-0001</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Receipt Number Prefix</label>
              <input
                type="text"
                value={formData.receiptPrefix}
                onChange={(e) => setFormData({ ...formData, receiptPrefix: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sky-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">Example output: {formData.receiptPrefix}-0001</p>
            </div>
          </div>
        </div>

        {/* Section 3: Grading Scheme */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span>3. Terminal Grading Scheme Config</span>
          </h2>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Grading Parameters (Grade:Range:Remark)
            </label>
            <textarea
              rows={3}
              value={formData.gradingScheme}
              onChange={(e) => setFormData({ ...formData, gradingScheme: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used automatically on report cards and result entry sheets.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
