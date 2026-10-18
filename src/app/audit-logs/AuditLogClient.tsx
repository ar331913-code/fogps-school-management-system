'use client';

import React, { useState } from 'react';
import { formatDate } from '@/lib/utils';
import {
  History,
  Shield,
  Globe,
  Search,
  Filter,
  Download,
  Laptop,
  Smartphone,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface LogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  module: string;
  recordId: string | null;
  details: string;
  createdAt: string;
}

interface AuditLogClientProps {
  initialLogs: LogItem[];
}

export default function AuditLogClient({ initialLogs }: AuditLogClientProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'VISITS' | 'OPERATIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const totalLogs = initialLogs.length;
  const visitLogs = initialLogs.filter((l) => l.action === 'VISIT' || l.module === 'WebsiteAccess');
  const opLogs = initialLogs.filter((l) => l.action !== 'VISIT' && l.module !== 'WebsiteAccess');
  
  const uniqueVisitorIps = new Set(
    visitLogs.map((l) => l.recordId).filter(Boolean)
  ).size;

  // Filter logs
  const filteredLogs = initialLogs.filter((log) => {
    // Tab filter
    if (activeTab === 'VISITS' && log.action !== 'VISIT' && log.module !== 'WebsiteAccess') return false;
    if (activeTab === 'OPERATIONS' && (log.action === 'VISIT' || log.module === 'WebsiteAccess')) return false;

    // Search query filter
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.userName && log.userName.toLowerCase().includes(q)) ||
      (log.userRole && log.userRole.toLowerCase().includes(q)) ||
      (log.recordId && log.recordId.toLowerCase().includes(q)) ||
      (log.module && log.module.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'IP / Target ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt).toISOString(),
      `"${(l.userName || 'Guest').replace(/"/g, '""')}"`,
      l.userRole || 'VISITOR',
      l.action,
      l.module,
      `"${(l.recordId || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FOGPS_Audit_Visitor_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <History className="w-5 h-5 text-sky-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              System Audit Trail & Security Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological record tracking every visitor who enters the website, along with all staff operations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Logs (CSV)</span>
        </button>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Records</span>
            <History className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalLogs}</div>
          <span className="text-[10px] text-slate-400">All system events</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Website Entries</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{visitLogs.length}</div>
          <span className="text-[10px] text-slate-400">Visitors tracked entering</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unique IPs Tracked</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">{uniqueVisitorIps}</div>
          <span className="text-[10px] text-slate-400">Distinct visitor addresses</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staff Actions</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{opLogs.length}</div>
          <span className="text-[10px] text-slate-400">Administrative & financial</span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({totalLogs})
            </button>
            <button
              onClick={() => setActiveTab('VISITS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'VISITS'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>Website Visitors ({visitLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('OPERATIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'OPERATIONS'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              <span>Staff Actions ({opLogs.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IP, user, details..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Person / Identity</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">IP Address / Identifier</th>
                <th className="py-3 px-4">Event & Visitor Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isVisit = log.action === 'VISIT' || log.module === 'WebsiteAccess';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDate(log.createdAt)}{' '}
                        <span className="text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {log.userName || (isVisit ? 'Guest Visitor' : 'System')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isVisit
                              ? log.userRole === 'VISITOR'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.userRole || (isVisit ? 'VISITOR' : 'ADMIN')}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isVisit
                              ? 'bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center gap-1 w-fit'
                              : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {isVisit && <Globe className="w-2.5 h-2.5" />}
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {log.recordId ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {log.recordId}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 leading-relaxed font-normal">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
