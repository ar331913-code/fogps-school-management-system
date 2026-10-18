import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Printer, School, Award, CheckCircle2 } from 'lucide-react';
import PrintButton from '@/components/common/PrintButton';

export const dynamic = 'force-dynamic';

interface ReportCardPageProps {
  params: {
    id: string;
  };
}

export default async function StudentReportCardPage({ params }: ReportCardPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { id } = params;

  const [student, settings] = await Promise.all([
    prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
      include: {
        currentClass: {
          include: {
            teachers: true,
          },
        },
        academicYear: true,
        attendances: true,
        results: {
          include: {
            subject: true,
            term: true,
            academicYear: true,
          },
          orderBy: { subject: { name: 'asc' } },
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

  // Attendance metrics
  const totalDays = student.attendances.length || 65; // Default term days
  const presentDays = student.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length || 60;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  // Compute Overall Result Averages
  const totalScores = student.results.reduce((sum, r) => sum + r.totalScore, 0);
  const averageScore =
    student.results.length > 0 ? (totalScores / student.results.length).toFixed(1) : '0.0';

  // Overall Remark Generator
  let overallRemark = 'Excellent terminal performance. Keep up the high standard.';
  const avgNum = parseFloat(averageScore);
  if (avgNum >= 80) overallRemark = 'Outstanding academic excellence! Demonstrates high potential and dedication.';
  else if (avgNum >= 70) overallRemark = 'Very good performance. Consistent hard work and effort shown across all subjects.';
  else if (avgNum >= 60) overallRemark = 'Good terminal effort. Encouraged to aim higher in core mathematics and science.';
  else if (avgNum >= 50) overallRemark = 'Credit pass. More attention needed during continuous assessments and revisions.';
  else overallRemark = 'Needs intensive remedial support and regular study monitoring at home.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls Bar (no print) */}
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
            Official Terminal Report Card Ready
          </span>
          <PrintButton label="Print Report Card" />
        </div>
      </div>

      {/* Official Printable Report Card Document */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6 print-card text-slate-900">
        
        {/* Header with School Crest & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2 border-slate-900 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-sky-900 text-white flex items-center justify-center p-3 shadow-md shrink-0">
            <School className="w-12 h-12 text-sky-200" />
          </div>

          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
              {settings?.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL'}
            </h1>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-widest mt-0.5">
              "{settings?.motto || 'Excellence, Discipline and Grace'}"
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              {settings?.address || 'P.O. Box 123, Spintex Road, Accra, Ghana'} • Tel: {settings?.phone || '+233 24 412 3456'}
            </p>
            <p className="text-[10px] text-slate-500">
              GPS: {settings?.digitalAddress || 'GR-492-3021'} • Email: {settings?.email || 'info@fullofgraceprep.edu.gh'}
            </p>
          </div>

          <div className="w-20 h-24 rounded-xl bg-slate-100 border border-slate-300 p-1 flex items-center justify-center overflow-hidden shrink-0">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={student.firstName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="font-bold text-xs text-slate-400 text-center">
                Photo
              </div>
            )}
          </div>
        </div>

        {/* Report Card Title Badge */}
        <div className="bg-slate-900 text-white py-2 px-4 rounded-xl text-center">
          <h2 className="text-xs font-black uppercase tracking-widest">
            OFFICIAL STUDENT TERMINAL ASSESSMENT REPORT
          </h2>
        </div>

        {/* Student Biographical Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Student Name</span>
            <span className="font-bold text-slate-900">{student.firstName} {student.middleName || ''} {student.lastName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Student ID</span>
            <span className="font-mono font-bold text-sky-800">{student.studentId}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Class / Grade</span>
            <span className="font-bold text-slate-900">{student.currentClass.name}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Academic Term</span>
            <span className="font-bold text-slate-900">Second Term (2025/2026)</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Gender</span>
            <span className="font-semibold text-slate-800">{student.gender}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Terminal Attendance</span>
            <span className="font-semibold text-slate-800">{presentDays} of {totalDays} days ({attendanceRate}%)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Overall Total Score</span>
            <span className="font-bold text-slate-900">{totalScores} marks</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Overall Average</span>
            <span className="font-black text-sky-800 text-sm">{averageScore}%</span>
          </div>
        </div>

        {/* Subject Scores Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                <th className="p-3 border-r border-slate-200">Subject</th>
                <th className="p-3 text-center border-r border-slate-200">Class Score (30%)</th>
                <th className="p-3 text-center border-r border-slate-200">Exam Score (70%)</th>
                <th className="p-3 text-center border-r border-slate-200">Total Score (100%)</th>
                <th className="p-3 text-center border-r border-slate-200">Grade</th>
                <th className="p-3">Subject Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {student.results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No results uploaded for this academic term yet.
                  </td>
                </tr>
              ) : (
                student.results.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-slate-900 border-r border-slate-100">
                      {r.subject.name}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 border-r border-slate-100">
                      {r.classScore}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700 border-r border-slate-100">
                      {r.examScore}
                    </td>
                    <td className="p-3 text-center font-black text-slate-900 border-r border-slate-100">
                      {r.totalScore}
                    </td>
                    <td className="p-3 text-center font-bold text-sky-800 border-r border-slate-100">
                      {r.grade}
                    </td>
                    <td className="p-3 text-slate-600 italic">
                      {r.remarks || 'Satisfactory'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Grading Scheme Reference */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600">
          <span className="font-bold text-slate-800 mr-2 uppercase">Grading Scale:</span>
          <span>A1 (80-100% Excellent) • B2 (70-79% Very Good) • B3 (60-69% Good) • C4-C6 (45-59% Credit/Pass) • D7-E8 (35-44% Pass) • F9 (0-34% Fail)</span>
        </div>

        {/* Remarks & Signatures Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-200 text-xs">
          
          {/* Class Teacher Remark */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Class Teacher's Assessment & Remark
              </span>
              <p className="text-slate-800 italic font-medium leading-relaxed">
                "{overallRemark}"
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">
                {student.currentClass.teachers?.[0]?.fullName || 'Mr. Samuel Mensah'}
              </span>
              <span className="text-[10px] text-slate-400">Class Teacher Signature</span>
            </div>
          </div>

          {/* Headteacher Remark & Stamp */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Headteacher's General Remark
              </span>
              <p className="text-slate-800 italic font-medium leading-relaxed">
                "Promising terminal outcome. Commended for exemplary attitude and consistent character."
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">
                Headteacher / Administrator
              </span>
              <span className="text-[10px] text-slate-400">Official Stamp & Date</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
