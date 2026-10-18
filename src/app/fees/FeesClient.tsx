'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CreditCard,
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface FeesClientProps {
  ledgers: any[];
  classes: any[];
  feeStructures: any[];
  recentPayments: any[];
  userRole: string;
}

export default function FeesClient({
  ledgers,
  classes,
  feeStructures,
  recentPayments,
  userRole,
}: FeesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ledgers' | 'payments' | 'structures'>('ledgers');
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);

  // Selected student for quick payment
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('School Fees Part/Full Payment');

  // Fee Structure Form
  const [structForm, setStructForm] = useState({
    name: '',
    classId: classes[0]?.id || '',
    amount: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Filtered Ledgers
  const filteredLedgers = ledgers.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.studentId.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass ? l.className === selectedClass : true;
    return matchSearch && matchClass;
  });

  // Calculate Aggregates
  const totalBilled = ledgers.reduce((sum, l) => sum + l.totalAssigned, 0);
  const totalCollected = ledgers.reduce((sum, l) => sum + l.totalPaid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amountPaid: parseFloat(paymentAmount),
          paymentMethod,
          reference,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');
      setModalSuccess(`Payment recorded! Receipt: ${data.payment.receiptNumber}`);
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

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch('/api/fees/structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(structForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create fee structure');
      setModalSuccess('Fee item added successfully!');
      setTimeout(() => {
        setShowStructureModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              School Fees & Bursary Ledger
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track student billing, fee payments, balances, and issue official receipts
          </p>
        </div>

        {(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStructForm({ name: '', classId: classes[0]?.id || '', amount: '' });
                setModalError('');
                setModalSuccess('');
                setShowStructureModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
            >
              + Create Fee Item
            </button>
            <button
              onClick={() => {
                setSelectedStudent(ledgers[0] || null);
                setPaymentAmount('');
                setModalError('');
                setModalSuccess('');
                setShowPaymentModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Term Billed
          </span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[11px] text-slate-500">Across all active classes</span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Total Fees Collected
          </span>
          <span className="text-2xl font-black text-emerald-800 block mt-1">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {recentPayments.length} Total Receipts Issued
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Outstanding Arrears
          </span>
          <span className="text-2xl font-black text-amber-800 block mt-1">
            {formatCurrency(totalOutstanding)}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold">
            Uncollected school fees
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ledgers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Student Fee Ledgers ({ledgers.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Receipts & Payment History ({recentPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'structures'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Fee Structures & Bills ({feeStructures.length})
        </button>
      </div>

      {/* TAB 1: Student Fee Ledgers */}
      {activeTab === 'ledgers' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student ledger by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Total Billed</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Balance</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No student fee records matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgers.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <Link href={`/students/${l.id}`} className="hover:text-sky-600">
                            {l.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-sky-700">{l.studentId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{l.className}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(l.totalAssigned)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{formatCurrency(l.totalPaid)}</td>
                        <td className="py-3 px-4 font-black">
                          <span className={l.balance === 0 ? 'text-emerald-600' : 'text-amber-700'}>
                            {formatCurrency(l.balance)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(userRole === 'ADMIN' || userRole === 'ACCOUNTANT') && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(l);
                                  setPaymentAmount(String(l.balance > 0 ? l.balance : ''));
                                  setModalError('');
                                  setModalSuccess('');
                                  setShowPaymentModal(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Pay
                              </button>
                            )}
                            <Link
                              href={`/students/${l.id}`}
                              className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                              title="View Ledger in 360 Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Payment Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Receipt No.</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.student?.firstName} {p.student?.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.student?.currentClass?.name}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700">{formatCurrency(p.amountPaid)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/fees/receipt/${p.receiptNumber}`}
                          className="px-3 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-lg text-xs inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Print Receipt</span>
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

      {/* TAB 3: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {feeStructures.map((f) => (
            <div key={f.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {f.class?.name}
                </span>
                <span className="text-base font-black text-sky-800">{formatCurrency(f.amount)}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
              <p className="text-[11px] text-slate-500">
                Category: {f.class?.category} • Academic Term Bill
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Collect Student School Fee</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <div className="p-3 rounded-xl bg-slate-50 font-bold text-slate-900">
                  {selectedStudent.name} ({selectedStudent.studentId}) — {selectedStudent.className}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount to Collect (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 800"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
                >
                  <option value="CASH">Cash</option>
                  <option value="MOMO">Mobile Money (MTN / Telecel / AT)</option>
                  <option value="BANK_TRANSFER">Bank Deposit / Transfer</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Slip Number</label>
                <input
                  type="text"
                  placeholder="e.g. MOMO-8829103 or Chq #0012"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {submitting ? 'Recording...' : 'Issue Receipt & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Fee Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Class Fee Item</h3>
              <button onClick={() => setShowStructureModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {modalError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{modalError}</div>}
            {modalSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{modalSuccess}</div>}

            <form onSubmit={handleCreateStructure} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Fee or PTA Levy"
                  value={structForm.name}
                  onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class *</label>
                <select
                  value={structForm.classId}
                  onChange={(e) => setStructForm({ ...structForm, classId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1200"
                  value={structForm.amount}
                  onChange={(e) => setStructForm({ ...structForm, amount: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {submitting ? 'Creating...' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
