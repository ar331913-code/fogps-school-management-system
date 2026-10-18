import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  School,
  FileText,
  UserCheck,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch Dashboard Statistics
  const totalStudents = await prisma.student.count();
  const maleStudents = await prisma.student.count({ where: { gender: 'Male' } });
  const femaleStudents = await prisma.student.count({ where: { gender: 'Female' } });
  const activeStudents = await prisma.student.count({ where: { status: 'ACTIVE' } });
  const graduatedStudents = await prisma.student.count({ where: { status: 'GRADUATED' } });
  const withdrawnStudents = await prisma.student.count({ where: { status: 'WITHDRAWN' } });

  // Today's Attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = await prisma.attendance.count({
    where: { date: todayStr, status: 'PRESENT' },
  });
  const absentToday = await prisma.attendance.count({
    where: { date: todayStr, status: 'ABSENT' },
  });
  const lateToday = await prisma.attendance.count({
    where: { date: todayStr, status: 'LATE' },
  });

  // Financial Overview
  const totalPaymentsAggregate = await prisma.feePayment.aggregate({
    _sum: { amountPaid: true },
  });
  const totalFeesCollected = totalPaymentsAggregate._sum.amountPaid || 0;

  // Total Expected Fees across all enrolled active students
  const activeClasses = await prisma.class.findMany({
    include: {
      _count: { select: { students: { where: { status: 'ACTIVE' } } } },
      feeStructures: true,
    },
  });

  let totalExpectedFees = 0;
  for (const cls of activeClasses) {
    const classTotalFee = cls.feeStructures.reduce((acc, f) => acc + f.amount, 0);
    totalExpectedFees += classTotalFee * cls._count.students;
  }

  const outstandingFees = Math.max(0, totalExpectedFees - totalFeesCollected);

  // Class Breakdown
  const classBreakdown = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      _count: {
        select: { students: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Recent Student Registrations
  const recentStudents = await prisma.student.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      currentClass: true,
    },
  });

  // Recent Fee Payments
  const recentPayments = await prisma.feePayment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { firstName: true, lastName: true, studentId: true } },
    },
  });

  // Recent System History
  const recentLogs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 mb-3 border border-white/10">
              <School className="w-3.5 h-3.5" />
              <span>Full of Grace Preparatory School Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Good day, {user.fullName}!
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Logged in as <span className="font-bold text-white uppercase">{user.role}</span>. Here is the operational summary of student enrollment, attendance, results, and fees.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
              <Link
                href="/students/register"
                className="px-4 py-2.5 rounded-xl bg-white text-sky-900 text-xs font-bold hover:bg-sky-50 transition-all shadow-md flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>Register Student</span>
              </Link>
            )}
            {(user.role === 'ADMIN' || user.role === 'ACCOUNTANT') && (
              <Link
                href="/fees"
                className="px-4 py-2.5 rounded-xl bg-amber-400 text-amber-950 text-xs font-bold hover:bg-amber-300 transition-all shadow-md flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record Payment</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/students"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">View Students</span>
          <span className="text-[10px] text-slate-400">Search directory</span>
        </Link>

        {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
          <Link
            href="/students/register"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">New Admission</span>
            <span className="text-[10px] text-slate-400">Register student</span>
          </Link>
        )}

        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link
            href="/attendance"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Take Attendance</span>
            <span className="text-[10px] text-slate-400">Daily roll call</span>
          </Link>
        )}

        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link
            href="/results"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Enter Results</span>
            <span className="text-[10px] text-slate-400">Scores & grades</span>
          </Link>
        )}

        {(user.role === 'ADMIN' || user.role === 'ACCOUNTANT') && (
          <Link
            href="/fees"
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col items-center text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Collect Fees</span>
            <span className="text-[10px] text-slate-400">Record & receipt</span>
          </Link>
        )}

        <Link
          href="/reports"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-800 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Generate Report</span>
          <span className="text-[10px] text-slate-400">Print & export</span>
        </Link>
      </div>

      {/* Main KPI Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Enrolled
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {activeStudents} Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Boys: <strong className="text-slate-800">{maleStudents}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              Girls: <strong className="text-slate-800">{femaleStudents}</strong>
            </span>
          </div>
        </div>

        {/* Attendance Today Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {presentToday + lateToday}
            </span>
            <span className="text-xs text-slate-500">Present</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">
              Late: <strong>{lateToday}</strong>
            </span>
            <span className="text-rose-600 font-semibold">
              Absent: <strong>{absentToday}</strong>
            </span>
          </div>
        </div>

        {/* Fees Collected Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fees Collected
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 truncate block">
              {formatCurrency(totalFeesCollected)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Term Expected:</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalExpectedFees)}</span>
          </div>
        </div>

        {/* Outstanding Balance Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Fees
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-700 truncate block">
              {formatCurrency(outstandingFees)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Graduated: <strong className="text-slate-800">{graduatedStudents}</strong></span>
            <span>Withdrawn: <strong className="text-slate-800">{withdrawnStudents}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Class Enrollment & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Enrollment Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Enrollment by Class
              </h2>
              <p className="text-xs text-slate-500">
                Distribution of students from Creche to JHS 3
              </p>
            </div>
            <Link
              href="/classes"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Manage Classes</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {classBreakdown.map((cls) => (
              <Link
                key={cls.id}
                href={`/students?classId=${cls.id}`}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-sky-600">
                    {cls.category}
                  </span>
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-sky-900 block truncate">
                    {cls.name}
                  </span>
                  <span className="text-lg font-black text-slate-900 group-hover:text-sky-700">
                    {cls._count.students}{' '}
                    <span className="text-[10px] font-normal text-slate-400">students</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Student Admissions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Admissions
                </h2>
                <p className="text-xs text-slate-500">Newly registered students</p>
              </div>
              <Link
                href="/students"
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                All
              </Link>
            </div>

            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No student records registered yet.
                </p>
              ) : (
                recentStudents.map((st) => (
                  <Link
                    key={st.id}
                    href={`/students/${st.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {st.firstName.charAt(0)}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-sky-600 truncate">
                          {st.firstName} {st.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {st.studentId} • {st.currentClass.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      {st.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/students/register"
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center block transition-all"
            >
              + Register Another Student
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Fee Payments & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Payments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Fee Payments
              </h2>
              <p className="text-xs text-slate-500">
                Transactions recorded by bursary
              </p>
            </div>
            <Link
              href="/fees"
              className="text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              View Ledger
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No fee payments recorded yet.
              </p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {p.student.firstName} {p.student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.receiptNumber} • {p.paymentMethod} • {formatDate(p.paymentDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-700">
                      {formatCurrency(p.amountPaid)}
                    </div>
                    <Link
                      href={`/fees/receipt/${p.receiptNumber}`}
                      className="text-[10px] font-semibold text-sky-600 hover:underline"
                    >
                      Receipt
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent System Activity Logs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                System Activity Trail
              </h2>
              <p className="text-xs text-slate-500">
                Recent operations performed by staff
              </p>
            </div>
            {user.role === 'ADMIN' && (
              <Link
                href="/audit-logs"
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                Full Audit Log
              </Link>
            )}
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No audit entries yet.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 truncate">
                        {log.userName || 'System'} ({log.userRole || 'ADMIN'})
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight line-clamp-1">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
