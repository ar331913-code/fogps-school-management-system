import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Printer, School, Receipt, CheckCircle2 } from 'lucide-react';
import PrintButton from '@/components/common/PrintButton';

export const dynamic = 'force-dynamic';

interface ReceiptPageProps {
  params: {
    receiptNumber: string;
  };
}

export default async function PaymentReceiptPage({ params }: ReceiptPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { receiptNumber } = params;

  const [payment, settings] = await Promise.all([
    prisma.feePayment.findUnique({
      where: { receiptNumber },
      include: {
        student: {
          include: {
            currentClass: {
              include: { feeStructures: true },
            },
            payments: true,
          },
        },
        feeStructure: true,
      },
    }),
    prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    }),
  ]);

  if (!payment) {
    notFound();
  }

  const student = payment.student;
  const totalAssignedFees = student.currentClass.feeStructures.reduce(
    (sum, f) => sum + f.amount,
    0
  );
  const totalPaid = student.payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const outstandingBalance = Math.max(0, totalAssignedFees - totalPaid);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Controls Bar (no print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Link
          href={`/students/${student.id}`}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Profile</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Official Bursary Receipt Verified
          </span>
          <PrintButton label="Print Official Receipt" />
        </div>
      </div>

      {/* Printable Receipt Document */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6 print-card text-slate-900">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b-2 border-slate-900 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-900 text-white flex items-center justify-center p-3 shadow-md shrink-0">
            <School className="w-10 h-10 text-sky-200" />
          </div>

          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
              {settings?.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL'}
            </h1>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-widest mt-0.5">
              "{settings?.motto || 'Excellence, Discipline and Grace'}"
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              {settings?.address || 'Spintex Road, Accra, Ghana'} • Tel: {settings?.phone || '+233 24 412 3456'}
            </p>
            <p className="text-[10px] text-slate-500">
              GPS: {settings?.digitalAddress || 'GR-492-3021'} • {settings?.email || 'info@fullofgraceprep.edu.gh'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Receipt Number
            </span>
            <span className="font-mono text-base font-black text-sky-900 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200 block mt-0.5">
              {payment.receiptNumber}
            </span>
          </div>
        </div>

        {/* Title Badge */}
        <div className="bg-slate-900 text-white py-1.5 px-4 rounded-xl text-center">
          <h2 className="text-xs font-black uppercase tracking-widest">
            OFFICIAL PAYMENT RECEIPT & BURSARY ACKNOWLEDGEMENT
          </h2>
        </div>

        {/* Receipt Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Student Full Name</span>
            <span className="text-sm font-bold text-slate-900">{student.firstName} {student.middleName || ''} {student.lastName}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Student ID</span>
            <span className="font-mono font-bold text-sky-800 text-sm">{student.studentId}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Class / Grade</span>
            <span className="font-bold text-slate-900 text-sm">{student.currentClass.name}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Payment Date</span>
            <span className="font-semibold text-slate-800">{formatDate(payment.paymentDate)}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Payment Method</span>
            <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
          </div>

          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Transaction Reference</span>
            <span className="font-mono font-semibold text-slate-800">{payment.reference || 'N/A'}</span>
          </div>
        </div>

        {/* Transaction Summary Table */}
        <div className="rounded-2xl border border-slate-300 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
              <tr>
                <th className="p-3.5">Payment Description</th>
                <th className="p-3.5 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3.5">
                  <div className="font-bold text-slate-900 text-sm">{payment.description || 'School Fee Payment'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Terminal bill payment credited to student ledger.
                  </div>
                </td>
                <td className="p-3.5 text-right font-black text-emerald-800 text-lg">
                  {formatCurrency(payment.amountPaid)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Account Standing Summary */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-center">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Total Term Fees</span>
            <span className="font-bold text-slate-900 block mt-0.5">{formatCurrency(totalAssignedFees)}</span>
          </div>
          <div>
            <span className="text-emerald-700 uppercase font-bold text-[10px] block">Total Paid to Date</span>
            <span className="font-black text-emerald-800 block mt-0.5">{formatCurrency(totalPaid)}</span>
          </div>
          <div>
            <span className="text-amber-700 uppercase font-bold text-[10px] block">Remaining Balance</span>
            <span className="font-black text-amber-900 block mt-0.5">{formatCurrency(outstandingBalance)}</span>
          </div>
        </div>

        {/* Signatures & Stamp */}
        <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Received By (Staff / Bursar)</span>
            <span className="font-bold text-slate-800 block mt-0.5">{payment.recordedByName || 'Mrs. Grace Osei (Bursar)'}</span>
            <span className="text-[10px] text-slate-400">Authorized Bursary Office</span>
          </div>

          <div className="text-center sm:text-right">
            <div className="w-36 h-10 border-b border-dashed border-slate-500 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Official Stamp & Signature
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
