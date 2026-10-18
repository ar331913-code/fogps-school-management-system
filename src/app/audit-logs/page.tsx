import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { History, Shield, Clock, Search, Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
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
            Complete chronological record of all administrative, staff, financial, and student updates
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Details & Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {log.userName || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.userRole || 'ADMIN'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
