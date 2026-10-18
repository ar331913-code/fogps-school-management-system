'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency, calculateAge } from '@/lib/utils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Heart,
  Users,
  Award,
  CreditCard,
  FileText,
  Clock,
  History,
  AlertCircle,
  CheckCircle2,
  Edit,
  IdCard,
  Printer,
  Plus,
  DollarSign,
  Upload,
  AlertTriangle,
  ChevronRight,
  Shield,
  Home,
  BookOpen,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentProfileClientProps {
  student: any;
  financials: {
    totalAssignedFees: number;
    totalAmountPaid: number;
    outstandingBalance: number;
  };
  attendanceStats: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    excusedDays: number;
    attendancePercentage: number;
  };
  settings: any;
  userRole: string;
  user: any;
}

export default function StudentProfileClient({
  student,
  financials,
  attendanceStats,
  settings,
  userRole,
  user,
}: StudentProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form states for modals
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'CASH',
    reference: '',
    description: 'School Fee Payment',
  });

  const [parentForm, setParentForm] = useState({
    fullName: '',
    relationship: 'Mother',
    phone: '',
    alternativePhone: '',
    email: '',
    occupation: '',
    residentialAddress: '',
    digitalAddress: '',
    isEmergencyContact: true,
    isPrimary: false,
  });

  const [docForm, setDocForm] = useState({
    title: '',
    documentType: 'BIRTH_CERTIFICATE',
    fileUrl: '',
  });

  const [disciplineForm, setDisciplineForm] = useState({
    title: '',
    description: '',
    actionTaken: '',
    status: 'Resolved',
    incidentDate: new Date().toISOString().split('T')[0],
  });

  const [newStatus, setNewStatus] = useState(student.status);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Handle Quick Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          amountPaid: parseFloat(paymentForm.amountPaid),
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference,
          description: paymentForm.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');
      setModalSuccess('Payment recorded successfully!');
      setTimeout(() => {
        setShowPaymentModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Parent
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/students/${student.id}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add parent');
      setModalSuccess('Parent/Guardian added successfully!');
      setTimeout(() => {
        setShowParentModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Document
  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/students/${student.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to attach document');
      setModalSuccess('Document attached successfully!');
      setTimeout(() => {
        setShowDocModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Discipline
  const handleDisciplineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/students/${student.id}/discipline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disciplineForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add discipline record');
      setModalSuccess('Discipline/Remark recorded successfully!');
      setTimeout(() => {
        setShowDisciplineModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update / Archive
  const handleStatusUpdate = async () => {
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update student status');
      setModalSuccess('Student status updated successfully!');
      setTimeout(() => {
        setShowStatusModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: BookOpen },
    { id: 'parents', label: `Parents & Guardians (${student.parents?.length || 0})`, icon: Users },
    { id: 'academic', label: 'Academic & Class', icon: GraduationCap },
    { id: 'attendance', label: `Attendance (${attendanceStats.attendancePercentage}%)`, icon: Calendar },
    { id: 'results', label: `Results & Grades (${student.results?.length || 0})`, icon: Award },
    { id: 'fees', label: 'Fees & Ledger', icon: CreditCard },
    { id: 'documents', label: `Documents (${student.documents?.length || 0})`, icon: FileText },
    { id: 'medical', label: 'Medical & Emergency', icon: Heart },
    { id: 'discipline', label: `Discipline & Remarks (${student.disciplineRecords?.length || 0})`, icon: AlertCircle },
    { id: 'history', label: `Chronological History (${student.history?.length || 0})`, icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Key Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-500/20 overflow-hidden border-2 border-white shrink-0">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                  {student.studentId}
                </span>
                <span
                  onClick={() => (userRole === 'ADMIN' ? setShowStatusModal(true) : null)}
                  className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    student.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : student.status === 'GRADUATED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {student.status} {userRole === 'ADMIN' && '✎'}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                  {student.studentCategory || 'Day Student'}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900">
                {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  {student.currentClass.name}
                </span>
                <span>•</span>
                <span>Age: <strong className="text-slate-800">{calculateAge(student.dateOfBirth)}</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-slate-800">{student.gender}</strong></span>
                <span>•</span>
                <span>House: <strong className="text-slate-800">{student.house || 'Grace House'}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
              <Link
                href={`/students/${student.id}/edit`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            )}

            {(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (
              <button
                onClick={() => {
                  setModalError('');
                  setModalSuccess('');
                  setShowPaymentModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Record Fee Payment</span>
              </button>
            )}

            <Link
              href={`/students/${student.id}/id-card`}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 flex items-center gap-1.5"
            >
              <IdCard className="w-3.5 h-3.5" />
              <span>Print ID Card</span>
            </Link>

            <Link
              href={`/students/${student.id}/report-card`}
              className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all border border-sky-200 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Report Card</span>
            </Link>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Fee Balance
            </span>
            <span className="text-base font-black text-amber-700">
              {formatCurrency(financials.outstandingBalance)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Paid: {formatCurrency(financials.totalAmountPaid)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Attendance Rate
            </span>
            <span className="text-base font-black text-emerald-700">
              {attendanceStats.attendancePercentage}%
            </span>
            <span className="text-[10px] text-slate-400 block">
              {attendanceStats.presentDays} of {attendanceStats.totalDays} sessions
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Terminal Results
            </span>
            <span className="text-base font-black text-purple-700">
              {student.results.length} Recorded
            </span>
            <span className="text-[10px] text-slate-400 block">
              Active Term 2
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Primary Emergency Contact
            </span>
            <span className="text-xs font-bold text-slate-800 block truncate">
              {student.emergencyContactName || student.parents?.[0]?.parent?.fullName || 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              {student.emergencyContactPhone || student.parents?.[0]?.parent?.phone || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-print">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                active
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Personal Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600" />
              <span>Student Summary</span>
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nationality:</span>
                <span className="font-semibold text-slate-800">{student.nationality}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Religion:</span>
                <span className="font-semibold text-slate-800">{student.religion || 'Christian'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                  {student.residentialAddress}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ghana GPS:</span>
                <span className="font-mono font-semibold text-slate-800">{student.digitalAddress || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-semibold text-rose-600">{student.bloodGroup || 'O+'}</span>
              </div>
            </div>
          </div>

          {/* Academic Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Class & Enrollment</span>
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Admission Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(student.admissionDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Admission Class:</span>
                <span className="font-semibold text-slate-800">{student.admissionClass?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Current Class:</span>
                <span className="font-bold text-sky-700">{student.currentClass.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Previous School:</span>
                <span className="font-semibold text-slate-800">{student.previousSchool || 'None'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">House:</span>
                <span className="font-semibold text-slate-800">{student.house || 'Grace House'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Class Teacher:</span>
                <span className="font-semibold text-slate-800">
                  {student.currentClass.teachers?.[0]?.fullName || 'Assigned Staff'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Parent / Emergency Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Primary Contact</span>
              </h2>
              <button
                onClick={() => setActiveTab('parents')}
                className="text-[10px] font-bold text-sky-600 hover:underline"
              >
                View All
              </button>
            </div>

            {student.parents?.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {(() => {
                  const p = student.parents[0].parent;
                  return (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Name:</span>
                        <span className="font-bold text-slate-900">{p.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Relationship:</span>
                        <span className="font-semibold text-slate-800">{p.relationship}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Phone:</span>
                        <a href={`tel:${p.phone}`} className="font-bold text-sky-600 hover:underline">
                          {p.phone}
                        </a>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Alternative:</span>
                        <span className="font-semibold text-slate-800">{p.alternativePhone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Occupation:</span>
                        <span className="font-semibold text-slate-800">{p.occupation || 'N/A'}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No parent recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. PERSONAL DETAILS TAB */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complete Personal Details</h2>
              <p className="text-xs text-slate-500">Official biographical records for {student.firstName} {student.lastName}</p>
            </div>
            {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
              <Link
                href={`/students/${student.id}/edit`}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Full Name</span>
              <span className="text-sm font-bold text-slate-900">
                {student.firstName} {student.middleName || ''} {student.lastName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Date of Birth</span>
              <span className="text-sm font-bold text-slate-900">{formatDate(student.dateOfBirth)} ({calculateAge(student.dateOfBirth)})</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Gender</span>
              <span className="text-sm font-bold text-slate-900">{student.gender}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Nationality</span>
              <span className="text-sm font-semibold text-slate-900">{student.nationality}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Religion</span>
              <span className="text-sm font-semibold text-slate-900">{student.religion || 'Christian'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Student Telephone</span>
              <span className="text-sm font-semibold text-slate-900">{student.phone || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Residential Address</span>
              <span className="text-sm font-semibold text-slate-900">{student.residentialAddress}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Digital Address (GPS)</span>
              <span className="text-sm font-mono font-bold text-sky-700">{student.digitalAddress || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Student Email</span>
              <span className="text-sm font-semibold text-slate-900">{student.email || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. PARENTS & GUARDIANS TAB */}
      {activeTab === 'parents' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Parents & Guardians</h2>
              <p className="text-xs text-slate-500">Legal contacts and emergency authorized individuals</p>
            </div>
            <button
              onClick={() => {
                setModalError('');
                setModalSuccess('');
                setShowParentModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parent / Guardian</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.parents?.map((sp: any, idx: number) => {
              const p = sp.parent;
              return (
                <div
                  key={sp.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                        {p.relationship.charAt(0)}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{p.fullName}</h3>
                        <span className="text-[11px] text-slate-500">{p.relationship}</span>
                      </div>
                    </div>
                    {sp.isPrimary && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Primary Contact
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${p.phone}`} className="font-bold text-sky-600 hover:underline">{p.phone}</a>
                    </div>
                    {p.alternativePhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Alt Phone:</span>
                        <span className="font-semibold text-slate-800">{p.alternativePhone}</span>
                      </div>
                    )}
                    {p.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-semibold text-slate-800">{p.email}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Occupation:</span>
                      <span className="font-semibold text-slate-800">{p.occupation || 'N/A'}</span>
                    </div>
                    {p.residentialAddress && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Address:</span>
                        <span className="font-semibold text-slate-800 text-right">{p.residentialAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ACADEMIC & CLASS TAB */}
      {activeTab === 'academic' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Academic Information & History</h2>
            <p className="text-xs text-slate-500">Class progression, enrollment details, and academic profile</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Current Assigned Class</span>
              <span className="text-base font-black text-sky-800 block mt-1">{student.currentClass.name}</span>
              <span className="text-[11px] text-slate-500 block">Category: {student.currentClass.category}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Admission Class</span>
              <span className="text-base font-black text-slate-800 block mt-1">{student.admissionClass?.name || 'Initial Entry'}</span>
              <span className="text-[11px] text-slate-500 block">Date: {formatDate(student.admissionDate)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">Academic Year</span>
              <span className="text-base font-black text-slate-800 block mt-1">{student.academicYear?.name || '2025/2026'}</span>
              <span className="text-[11px] text-slate-500 block">Status: {student.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Attendance Register</h2>
              <p className="text-xs text-slate-500">Record of daily roll-call attendance across all sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200">
                Attendance Rate: {attendanceStats.attendancePercentage}%
              </span>
              {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                <Link
                  href="/attendance"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all"
                >
                  Record Attendance
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-lg font-black text-emerald-700">{attendanceStats.presentDays}</span>
              <span className="text-[11px] font-semibold text-emerald-800 block">Present</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-lg font-black text-amber-700">{attendanceStats.lateDays}</span>
              <span className="text-[11px] font-semibold text-amber-800 block">Late</span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
              <span className="text-lg font-black text-rose-700">{attendanceStats.absentDays}</span>
              <span className="text-[11px] font-semibold text-rose-800 block">Absent</span>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
              <span className="text-lg font-black text-sky-700">{attendanceStats.excusedDays}</span>
              <span className="text-[11px] font-semibold text-sky-800 block">Excused</span>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.attendances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      No attendance records logged yet.
                    </td>
                  </tr>
                ) : (
                  student.attendances.map((att: any) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{att.date}</td>
                      <td className="p-3 text-slate-600">{att.class?.name || student.currentClass.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'LATE'
                              ? 'bg-amber-100 text-amber-800'
                              : att.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{att.remarks || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RESULTS & REPORT CARDS TAB */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Examination Results & Performance</h2>
              <p className="text-xs text-slate-500">Continuous assessment class scores (30%) and exam scores (70%)</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/students/${student.id}/report-card`}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generate Official Report Card</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Class Score (30%)</th>
                  <th className="p-3">Exam Score (70%)</th>
                  <th className="p-3">Total Score</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Teacher's Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No examination results entered yet for this term.
                    </td>
                  </tr>
                ) : (
                  student.results.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{r.subject?.name}</td>
                      <td className="p-3 font-semibold text-slate-700">{r.classScore}</td>
                      <td className="p-3 font-semibold text-slate-700">{r.examScore}</td>
                      <td className="p-3 font-black text-sky-800">{r.totalScore}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-xs">
                          {r.grade}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 italic">{r.remarks || 'Satisfactory'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. FEES & LEDGER TAB */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Fee Account & Payment Ledger</h2>
              <p className="text-xs text-slate-500">Assigned school charges, receipted transactions, and outstanding balance</p>
            </div>
            {(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (
              <button
                onClick={() => {
                  setModalError('');
                  setModalSuccess('');
                  setShowPaymentModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Record Fee Payment</span>
              </button>
            )}
          </div>

          {/* Fee Balance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Assigned Fees</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{formatCurrency(financials.totalAssignedFees)}</span>
              <span className="text-[10px] text-slate-500">{student.currentClass.name} Standard Bill</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">Total Amount Paid</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">{formatCurrency(financials.totalAmountPaid)}</span>
              <span className="text-[10px] text-emerald-600">{student.payments.length} Payments Received</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-700 block">Outstanding Balance</span>
              <span className="text-xl font-black text-amber-900 block mt-1">{formatCurrency(financials.outstandingBalance)}</span>
              <span className="text-[10px] text-amber-700 font-semibold">
                {financials.outstandingBalance === 0 ? 'Fully Paid' : 'Payment Due'}
              </span>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Receipt No.</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Reference / Cheque</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  student.payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                      <td className="p-3 text-slate-700">{formatDate(p.paymentDate)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{p.reference || '—'}</td>
                      <td className="p-3 text-slate-700">{p.description || 'Tuition Payment'}</td>
                      <td className="p-3 font-black text-emerald-700">{formatCurrency(p.amountPaid)}</td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/fees/receipt/${p.receiptNumber}`}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Student Documents & Certificates</h2>
              <p className="text-xs text-slate-500">Birth certificates, previous school transcripts, and medical records</p>
            </div>
            <button
              onClick={() => {
                setModalError('');
                setModalSuccess('');
                setShowDocModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {student.documents.length === 0 ? (
              <p className="col-span-full text-center text-slate-400 py-8 text-xs">
                No documents uploaded yet for this student.
              </p>
            ) : (
              student.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400 block">{doc.documentType} • {formatDate(doc.uploadedAt)}</span>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shrink-0"
                  >
                    View
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 9. MEDICAL TAB */}
      {activeTab === 'medical' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Medical & Emergency Information</h2>
            <p className="text-xs text-slate-500">Confidential medical conditions and emergency contact instructions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Emergency Contact</span>
              <p className="text-sm font-bold text-slate-900">{student.emergencyContactName || 'Dr. Joseph Agyemang'}</p>
              <p className="text-xs text-slate-600">Phone: <strong>{student.emergencyContactPhone || student.parents?.[0]?.parent?.phone || 'N/A'}</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Blood Group</span>
              <p className="text-sm font-bold text-rose-600">{student.bloodGroup || 'O+'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Known Allergies</span>
              <p className="text-xs text-slate-800">{student.knownAllergies || 'None recorded'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Medical Conditions</span>
              <p className="text-xs text-slate-800">{student.medicalConditions || 'None recorded'}</p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Special Doctor's Instructions</span>
              <p className="text-xs text-slate-700 leading-relaxed">{student.specialMedicalNotes || 'No special medical instructions provided.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. DISCIPLINE & REMARKS TAB */}
      {activeTab === 'discipline' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Discipline Records & Teacher Remarks</h2>
              <p className="text-xs text-slate-500">Official incident notes and behavioral commendations</p>
            </div>
            <button
              onClick={() => {
                setModalError('');
                setModalSuccess('');
                setShowDisciplineModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Remark / Incident</span>
            </button>
          </div>

          <div className="space-y-3">
            {student.disciplineRecords.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-xs">
                No disciplinary incidents or special remarks recorded.
              </p>
            ) : (
              student.disciplineRecords.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{rec.title}</h4>
                    <span className="text-[10px] text-slate-400">{formatDate(rec.incidentDate)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rec.description}</p>
                  {rec.actionTaken && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Action Taken:</strong> {rec.actionTaken}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 pt-1">
                    Recorded by: {rec.recordedBy}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 11. CHRONOLOGICAL STUDENT HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Single Source of Truth Chronological Timeline</h2>
            <p className="text-xs text-slate-500">Audit trail of all actions, admissions, promotions, payments and updates</p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {student.history.length === 0 ? (
              <p className="text-xs text-slate-400">No history events logged.</p>
            ) : (
              student.history.map((h: any) => (
                <div key={h.id} className="relative text-xs space-y-1">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-xs" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{h.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(h.createdAt)}</span>
                  </div>
                  <p className="text-slate-600">{h.description}</p>
                  {h.performedBy && (
                    <span className="text-[10px] text-slate-400 block">By: {h.performedBy}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Fee Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Record Fee Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>
            )}
            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <div className="p-2.5 rounded-xl bg-slate-50 font-bold text-slate-800">
                  {student.firstName} {student.lastName} ({student.studentId})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Paid (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500"
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-sky-500/30 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                >
                  <option value="CASH">Cash</option>
                  <option value="MOMO">Mobile Money (MTN/Telecel/AT)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / Deposit</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Slip No.</label>
                <input
                  type="text"
                  placeholder="e.g. MTN-8839210 or Chq 0029"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {submitting ? 'Recording...' : 'Generate Receipt & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Parent Modal */}
      {showParentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Parent / Legal Guardian</h3>
              <button onClick={() => setShowParentModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <form onSubmit={handleParentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={parentForm.fullName}
                    onChange={(e) => setParentForm({ ...parentForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship *</label>
                  <select
                    value={parentForm.relationship}
                    onChange={(e) => setParentForm({ ...parentForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={parentForm.phone}
                    onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={parentForm.occupation}
                    onChange={(e) => setParentForm({ ...parentForm, occupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={parentForm.residentialAddress}
                  onChange={(e) => setParentForm({ ...parentForm, residentialAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowParentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Link Parent to Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Attach Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Attach Student Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <form onSubmit={handleDocSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birth Certificate or Primary 3 Report"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                  <option value="PREVIOUS_REPORT">Previous School Report</option>
                  <option value="ADMISSION_FORM">Admission Application Form</option>
                  <option value="MEDICAL_RECORD">Medical Assessment Record</option>
                  <option value="OTHER">Other School Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Link / URL</label>
                <input
                  type="text"
                  placeholder="e.g. /docs/birth-cert.pdf"
                  value={docForm.fileUrl}
                  onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {submitting ? 'Attaching...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Discipline Remark Modal */}
      {showDisciplineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Disciplinary Record / Remark</h3>
              <button onClick={() => setShowDisciplineModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <form onSubmit={handleDisciplineSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exemplary conduct in Science Fair"
                  value={disciplineForm.title}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details & Description *</label>
                <textarea
                  rows={3}
                  required
                  value={disciplineForm.description}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Taken</label>
                <input
                  type="text"
                  placeholder="e.g. Awarded Certificate of Honor / Parent notified"
                  value={disciplineForm.actionTaken}
                  onChange={(e) => setDisciplineForm({ ...disciplineForm, actionTaken: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisciplineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Status / Archive Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Update Student Enrollment Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Select the new academic status for <strong>{student.firstName} {student.lastName}</strong>.
                Changing status to <em>Withdrawn</em> or <em>Graduated</em> preserves all historical records without permanent deletion.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Currently Enrolled)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily absent)</option>
                  <option value="GRADUATED">GRADUATED (Completed school cycle)</option>
                  <option value="TRANSFERRED">TRANSFERRED (Relocated to other school)</option>
                  <option value="WITHDRAWN">WITHDRAWN (Archived)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {submitting ? 'Updating...' : 'Save New Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
