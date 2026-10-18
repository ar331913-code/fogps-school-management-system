'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import PrintButton from '@/components/common/PrintButton';

interface ReportsClientProps {
  classes: any[];
  settings: any;
  userRole: string;
}

export default function ReportsClient({
  classes,
  settings,
  userRole,
}: ReportsClientProps) {
  const [reportType, setReportType] = useState<'students' | 'debtors' | 'attendance_summary'>('students');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const url = `/api/reports?type=${reportType}${selectedClassId ? `&classId=${selectedClassId}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedClassId]);

  const exportCSV = () => {
    if (data.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'students') {
      csvContent += 'Student ID,First Name,Last Name,Gender,Class,Status,Residential Address,Admission Date\n';
      data.forEach((s) => {
        csvContent += `"${s.studentId}","${s.firstName}","${s.lastName}","${s.gender}","${s.currentClass?.name}","${s.status}","${s.residentialAddress}","${formatDate(s.admissionDate)}"\n`;
      });
    } else if (reportType === 'debtors') {
      csvContent += 'Student ID,Name,Class,Billed,Paid,Outstanding Balance,Parent Name,Parent Phone\n';
      data.forEach((d) => {
        csvContent += `"${d.studentId}","${d.name}","${d.className}","${d.totalAssigned}","${d.totalPaid}","${d.balance}","${d.parentName}","${d.parentPhone}"\n`;
      });
    } else if (reportType === 'attendance_summary') {
      csvContent += 'Class,Category,Students,Sessions Logged,Attendance Rate (%)\n';
      data.forEach((a) => {
        csvContent += `"${a.className}","${a.category}","${a.studentCount}","${a.totalLogged}","${a.rate}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FOGPS_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header (no print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              School Reports & Analytics Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official administrative, demographic, bursary, and attendance reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
          <PrintButton label="Print Report" />
        </div>
      </div>

      {/* Report Controls (no print) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'students'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Enrollment</span>
          </button>

          {(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (
            <button
              onClick={() => setReportType('debtors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                reportType === 'debtors'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Fee Debtors Ledger</span>
            </button>
          )}

          <button
            onClick={() => setReportType('attendance_summary')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'attendance_summary'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance Summary</span>
          </button>
        </div>

        {reportType === 'students' && (
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6 print-card text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <h2 className="text-xl font-black uppercase text-slate-950">
              {settings?.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL'}
            </h2>
            <p className="text-xs text-sky-800 font-bold uppercase tracking-wider">
              {reportType === 'students' && 'OFFICIAL STUDENT DEMOGRAPHIC & ENROLLMENT REPORT'}
              {reportType === 'debtors' && 'OFFICIAL SCHOOL FEES OUTSTANDING DEBTORS STATEMENT'}
              {reportType === 'attendance_summary' && 'TERMINAL CLASS ATTENDANCE & PUNCTUALITY SUMMARY'}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
            <div>Academic Session: <strong>2025/2026</strong></div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-slate-300">
          {reportType === 'students' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Guardian Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{s.firstName} {s.lastName}</td>
                    <td className="p-3 font-mono text-sky-800">{s.studentId}</td>
                    <td className="p-3 text-slate-600">{s.gender}</td>
                    <td className="p-3 font-semibold">{s.currentClass?.name}</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3 text-slate-600">{s.parents?.[0]?.parent?.phone || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'debtors' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Billed</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Outstanding Arrears</th>
                  <th className="p-3">Parent Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((d, idx) => (
                  <tr key={d.id}>
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{d.name}</td>
                    <td className="p-3 font-mono text-sky-800">{d.studentId}</td>
                    <td className="p-3 font-semibold">{d.className}</td>
                    <td className="p-3 font-semibold">{formatCurrency(d.totalAssigned)}</td>
                    <td className="p-3 font-semibold text-emerald-700">{formatCurrency(d.totalPaid)}</td>
                    <td className="p-3 font-black text-amber-700">{formatCurrency(d.balance)}</td>
                    <td className="p-3 text-slate-700 font-semibold">{d.parentPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'attendance_summary' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Class Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Total Students</th>
                  <th className="p-3">Roll-Calls Logged</th>
                  <th className="p-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((a, idx) => (
                  <tr key={a.classId}>
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{a.className}</td>
                    <td className="p-3 text-slate-600">{a.category}</td>
                    <td className="p-3 font-bold">{a.studentCount}</td>
                    <td className="p-3 text-slate-600">{a.totalLogged}</td>
                    <td className="p-3 text-right font-black text-emerald-700">{a.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-xs text-slate-400">
          <span>Official Document • Full of Grace Preparatory School</span>
          <span>Printed by: Administration Portal</span>
        </div>
      </div>
    </div>
  );
}
