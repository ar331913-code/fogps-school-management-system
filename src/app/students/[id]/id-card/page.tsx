import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Printer,
  ArrowLeft,
  School,
  IdCard,
  QrCode,
  Shield,
  Phone,
} from 'lucide-react';
import PrintButton from '@/components/common/PrintButton';

export const dynamic = 'force-dynamic';

interface IdCardPageProps {
  params: {
    id: string;
  };
}

export default async function StudentIdCardPage({ params }: IdCardPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = params;

  const [student, settings] = await Promise.all([
    prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
      include: {
        currentClass: true,
        academicYear: true,
        parents: {
          include: { parent: true },
        },
      },
    }),
    prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    }),
  ]);

  if (!student) {
    notFound();
  }

  const primaryParent = student.parents?.find((p) => p.isPrimary)?.parent || student.parents?.[0]?.parent;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls Bar (hidden in print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link
          href={`/students/${student.id}`}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Print preview ready • Standard PVC format
          </span>
          <PrintButton />
        </div>
      </div>

      {/* Printable ID Cards Preview */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-8">
        
        {/* CARD FRONT */}
        <div className="w-[340px] h-[520px] rounded-3xl bg-gradient-to-b from-sky-900 via-sky-800 to-slate-950 text-white shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-sky-600/30 print-card">
          {/* Top Decorative Arc */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-white/5 rounded-b-[100px] pointer-events-none" />
          <div className="absolute top-2 right-2 w-20 h-20 bg-sky-400/10 rounded-full blur-xl pointer-events-none" />

          {/* School Brand Header */}
          <div className="text-center relative z-10">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 shadow-inner">
              <School className="w-5 h-5 text-sky-200" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-sky-100 leading-tight">
              {settings?.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL'}
            </h2>
            <p className="text-[9px] text-sky-300 font-medium italic mt-0.5">
              "{settings?.motto || 'Excellence, Discipline & Grace'}"
            </p>
          </div>

          {/* Student Photo & Name */}
          <div className="text-center relative z-10 flex flex-col items-center">
            <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-xl border-2 border-sky-400/50 mb-3 overflow-hidden">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.firstName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 text-slate-800 flex items-center justify-center font-black text-2xl">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
              )}
            </div>

            <h3 className="text-base font-black text-white tracking-tight">
              {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-400/30 mt-1">
              STUDENT IDENTIFICATION
            </span>
          </div>

          {/* Student Details Grid */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-[11px] space-y-1.5 relative z-10">
            <div className="flex justify-between">
              <span className="text-sky-200/80">Student ID:</span>
              <span className="font-mono font-bold text-white">{student.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-200/80">Class:</span>
              <span className="font-bold text-white">{student.currentClass.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-200/80">Date of Birth:</span>
              <span className="font-semibold text-white">{formatDate(student.dateOfBirth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-200/80">Academic Year:</span>
              <span className="font-semibold text-white">{student.academicYear?.name || '2025/2026'}</span>
            </div>
          </div>

          {/* Footer Barcode / Issue Date */}
          <div className="flex items-center justify-between text-[9px] text-sky-200/70 border-t border-white/10 pt-2 relative z-10">
            <span>Issue Date: {new Date().getFullYear()}</span>
            <span className="font-mono tracking-widest uppercase">OFFICIAL ID</span>
          </div>
        </div>

        {/* CARD BACK */}
        <div className="w-[340px] h-[520px] rounded-3xl bg-slate-900 text-white shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-slate-700 print-card">
          {/* Card Back Header */}
          <div className="space-y-2 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Terms & Emergency Information
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              This card is the property of Full of Grace Preparatory School. If found, please return to the school administration or call the numbers below.
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-3 bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Emergency Contact (Parent / Guardian)
              </span>
              <span className="font-bold text-white block mt-0.5">
                {student.emergencyContactName || primaryParent?.fullName || 'School Admin'}
              </span>
              <span className="text-sky-300 font-semibold block text-[11px]">
                {student.emergencyContactPhone || primaryParent?.phone || settings?.phone}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-700 flex justify-between text-[11px]">
              <span className="text-slate-400">Blood Group:</span>
              <span className="font-bold text-rose-400">{student.bloodGroup || 'O+'}</span>
            </div>
          </div>

          {/* School Contact Info */}
          <div className="text-[10px] text-slate-400 space-y-1 text-center">
            <p className="font-bold text-slate-200">{settings?.schoolName || 'Full of Grace Prep'}</p>
            <p>{settings?.address || 'Spintex Road, Accra, Ghana'}</p>
            <p>Tel: {settings?.phone || '+233 24 412 3456'}</p>
            <p>GPS: {settings?.digitalAddress || 'GR-492-3021'}</p>
          </div>

          {/* QR Code & Signature Placeholder */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              {/* Simulated QR Code for Student ID */}
              <div className="w-12 h-12 flex items-center justify-center text-slate-900 font-mono text-[8px] font-bold text-center border border-slate-300">
                [QR: {student.studentId}]
              </div>
            </div>
            <div className="text-right">
              <div className="w-24 h-6 border-b border-dashed border-slate-500 mb-1" />
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                Headteacher Signature
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
