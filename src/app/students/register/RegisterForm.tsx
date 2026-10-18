'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  User,
  Heart,
  Users,
  GraduationCap,
  Sparkles,
  Camera,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  School,
  IdCard,
} from 'lucide-react';

interface RegisterFormProps {
  classes: any[];
  academicYears: any[];
  suggestedId: string;
}

export default function RegisterForm({
  classes,
  academicYears,
  suggestedId,
}: RegisterFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Ghanaian',
    religion: 'Christian',
    residentialAddress: '',
    digitalAddress: '',
    phone: '',
    email: '',
    previousSchool: '',
    house: 'Grace House (Blue)',
    studentCategory: 'Day',
    photoUrl: '',

    // Step 2: Academic
    customStudentId: suggestedId,
    admissionDate: new Date().toISOString().split('T')[0],
    admissionClassId: classes[0]?.id || '',
    currentClassId: classes[0]?.id || '',
    academicYearId: academicYears[0]?.id || '',
    status: 'ACTIVE',

    // Step 3: Medical / Emergency
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodGroup: 'O+',
    knownAllergies: '',
    medicalConditions: '',
    specialMedicalNotes: '',

    // Step 4: Parents/Guardians
    parents: [
      {
        fullName: '',
        relationship: 'Father',
        phone: '',
        alternativePhone: '',
        email: '',
        occupation: '',
        residentialAddress: '',
        digitalAddress: '',
        isPrimary: true,
        isEmergencyContact: true,
      },
    ],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleParentChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.parents];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, parents: updated };
    });
  };

  const addParent = () => {
    setFormData((prev) => ({
      ...prev,
      parents: [
        ...prev.parents,
        {
          fullName: '',
          relationship: 'Mother',
          phone: '',
          alternativePhone: '',
          email: '',
          occupation: '',
          residentialAddress: '',
          digitalAddress: '',
          isPrimary: false,
          isEmergencyContact: false,
        },
      ],
    }));
  };

  const removeParent = (index: number) => {
    if (formData.parents.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      parents: prev.parents.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number) => {
    setError('');
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('First Name and Last Name are required.');
        return false;
      }
      if (!formData.dateOfBirth) {
        setError('Date of Birth is required.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.currentClassId) {
        setError('Please select a Current Class for the student.');
        return false;
      }
    } else if (step === 4) {
      if (formData.parents.length > 0) {
        const p1 = formData.parents[0];
        if (!p1.fullName.trim() || !p1.phone.trim()) {
          setError('Primary parent full name and telephone number are required.');
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register student.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/students/${data.student.id}`);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred during student registration.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal Information', icon: User },
    { num: 2, title: 'Academic & Class Info', icon: GraduationCap },
    { num: 3, title: 'Medical & Emergency', icon: Heart },
    { num: 4, title: 'Parents & Guardians', icon: Users },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-800 to-slate-900 p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <UserPlus className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">
                New Student Admission & Registration
              </h1>
              <p className="text-xs text-sky-200">
                Full of Grace Preparatory School • Comprehensive digital enrollment
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
              Auto Student ID
            </span>
            <span className="text-sm font-mono font-bold block text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10 mt-0.5">
              {formData.customStudentId}
            </span>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          {steps.map((s) => {
            const Icon = s.icon;
            const active = currentStep === s.num;
            const completed = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (completed || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                className={`p-3 rounded-2xl flex items-center gap-2.5 transition-all text-left ${
                  active
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : completed
                    ? 'bg-sky-700/60 text-sky-100 hover:bg-sky-700'
                    : 'bg-white/5 text-sky-300/60 hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    active
                      ? 'bg-sky-600 text-white'
                      : completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-sky-300'
                  }`}
                >
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase tracking-wider block opacity-75">
                    Step 0{s.num}
                  </span>
                  <span className="text-xs truncate block">{s.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Student registered successfully! Redirecting to student profile...</span>
          </div>
        )}

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                1. Student Personal Details
              </h2>
              <p className="text-xs text-slate-500">
                Enter biographical information of the prospective student
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emmanuel"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kofi"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agyemang"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Residential Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 42, Spintex Road, Accra"
                  value={formData.residentialAddress}
                  onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghana Digital Address (GPS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GR-492-3021"
                  value={formData.digitalAddress}
                  onChange={(e) => handleInputChange('digitalAddress', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +233 50 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. student@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Religion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Christian / Muslim"
                  value={formData.religion}
                  onChange={(e) => handleInputChange('religion', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            {/* Photo input */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 shadow-2xs">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Passport Photo URL
                </label>
                <input
                  type="text"
                  placeholder="Enter image URL or photo asset link (e.g. /students/avatar1.jpg)"
                  value={formData.photoUrl}
                  onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Passport photo will appear on the Student ID Card and Report Cards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Academic Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                2. Academic Class & Admission Setup
              </h2>
              <p className="text-xs text-slate-500">
                Assign admission class, academic year, and verify student identification
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student ID / Admission Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.customStudentId}
                    onChange={(e) => handleInputChange('customStudentId', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-sky-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Unique identifier used across all modules. Auto-incremented sequence.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admission Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.admissionDate}
                  onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admission Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.admissionClassId}
                  onChange={(e) => handleInputChange('admissionClassId', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Assigned Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.currentClassId}
                  onChange={(e) => handleInputChange('currentClassId', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={formData.academicYearId}
                  onChange={(e) => handleInputChange('academicYearId', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous School Attended
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grace Int. School"
                  value={formData.previousSchool}
                  onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  School House
                </label>
                <select
                  value={formData.house}
                  onChange={(e) => handleInputChange('house', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="Grace House (Blue)">Grace House (Blue)</option>
                  <option value="Faith House (Yellow)">Faith House (Yellow)</option>
                  <option value="Hope House (Green)">Hope House (Green)</option>
                  <option value="Love House (Red)">Love House (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Category
                </label>
                <select
                  value={formData.studentCategory}
                  onChange={(e) => handleInputChange('studentCategory', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="Day">Day Student</option>
                  <option value="Boarding">Boarding Student</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Medical & Emergency */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                3. Health, Medical & Emergency Contacts
              </h2>
              <p className="text-xs text-slate-500">
                Confidential medical notes accessible only to authorized staff
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Joseph Agyemang"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +233 24 555 6789"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Known Allergies (Food, Medicine, Dust, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanuts, Penicillin"
                  value={formData.knownAllergies}
                  onChange={(e) => handleInputChange('knownAllergies', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Medical Conditions (Asthma, Epilepsy, Sickle Cell, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild Asthma (Inhaler)"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Special Medical Instructions / Doctor's Notes
              </label>
              <textarea
                rows={3}
                placeholder="Enter any additional care directions or precautions for the class teacher..."
                value={formData.specialMedicalNotes}
                onChange={(e) => handleInputChange('specialMedicalNotes', e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Parents & Guardians */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  4. Parents & Legal Guardians Information
                </h2>
                <p className="text-xs text-slate-500">
                  Link one or more parents/guardians responsible for this student
                </p>
              </div>
              <button
                type="button"
                onClick={addParent}
                className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Parent</span>
              </button>
            </div>

            <div className="space-y-6">
              {formData.parents.map((parent, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Guardian #{idx + 1} ({parent.relationship || 'Guardian'})</span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                          Primary Contact
                        </span>
                      )}
                    </span>

                    {formData.parents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParent(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Joseph Agyemang"
                        value={parent.fullName}
                        onChange={(e) => handleParentChange(idx, 'fullName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Relationship to Student <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={parent.relationship}
                        onChange={(e) => handleParentChange(idx, 'relationship', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +233 24 555 6789"
                        value={parent.phone}
                        onChange={(e) => handleParentChange(idx, 'phone', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alternative Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +233 20 888 1234"
                        value={parent.alternativePhone}
                        onChange={(e) => handleParentChange(idx, 'alternativePhone', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. parent@gmail.com"
                        value={parent.email}
                        onChange={(e) => handleParentChange(idx, 'email', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Occupation / Profession
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Medical Doctor / Trader"
                        value={parent.occupation}
                        onChange={(e) => handleParentChange(idx, 'occupation', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Residential Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. House No. 42, Spintex Close, Accra"
                        value={parent.residentialAddress}
                        onChange={(e) => handleParentChange(idx, 'residentialAddress', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ghana Digital Address (GPS)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GR-492-8812"
                        value={parent.digitalAddress}
                        onChange={(e) => handleParentChange(idx, 'digitalAddress', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation / Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting Registration...' : 'Complete & Save Student'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
