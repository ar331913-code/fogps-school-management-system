'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  User,
  GraduationCap,
  Heart,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';

interface EditStudentFormProps {
  student: any;
  classes: any[];
  academicYears: any[];
}

export default function EditStudentForm({
  student,
  classes,
  academicYears,
}: EditStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: student.firstName || '',
    middleName: student.middleName || '',
    lastName: student.lastName || '',
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split('T')[0]
      : '',
    gender: student.gender || 'Male',
    nationality: student.nationality || 'Ghanaian',
    religion: student.religion || 'Christian',
    residentialAddress: student.residentialAddress || '',
    digitalAddress: student.digitalAddress || '',
    phone: student.phone || '',
    email: student.email || '',
    previousSchool: student.previousSchool || '',
    currentClassId: student.currentClassId || '',
    status: student.status || 'ACTIVE',
    photoUrl: student.photoUrl || '',
    house: student.house || 'Grace House (Blue)',
    studentCategory: student.studentCategory || 'Day',
    emergencyContactName: student.emergencyContactName || '',
    emergencyContactPhone: student.emergencyContactPhone || '',
    bloodGroup: student.bloodGroup || 'O+',
    knownAllergies: student.knownAllergies || '',
    medicalConditions: student.medicalConditions || '',
    specialMedicalNotes: student.specialMedicalNotes || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update student profile.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/students/${student.id}`);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 sm:p-8 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Edit className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              Edit Student Profile
            </h1>
            <p className="text-xs text-sky-200">
              {student.firstName} {student.lastName} • ID: {student.studentId}
            </p>
          </div>
        </div>

        <Link
          href={`/students/${student.id}`}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile updated successfully! Redirecting...</span>
          </div>
        )}

        {/* Section 1: Names & Biographical */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            1. Personal & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
              <input
                type="text"
                required
                value={formData.residentialAddress}
                onChange={(e) => handleChange('residentialAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ghana Digital Address</label>
              <input
                type="text"
                value={formData.digitalAddress}
                onChange={(e) => handleChange('digitalAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Assignment */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            2. Class Assignment & Academic Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Class *</label>
              <select
                value={formData.currentClassId}
                onChange={(e) => handleChange('currentClassId', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="TRANSFERRED">TRANSFERRED</option>
                <option value="WITHDRAWN">WITHDRAWN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School House</label>
              <select
                value={formData.house}
                onChange={(e) => handleChange('house', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              >
                <option value="Grace House (Blue)">Grace House (Blue)</option>
                <option value="Faith House (Yellow)">Faith House (Yellow)</option>
                <option value="Hope House (Green)">Hope House (Green)</option>
                <option value="Love House (Red)">Love House (Red)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Health & Emergency */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            3. Medical & Emergency Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
              <input
                type="text"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href={`/students/${student.id}`}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
