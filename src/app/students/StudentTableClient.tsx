'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Eye,
  Edit,
  IdCard,
  FileText,
  CreditCard,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface StudentTableClientProps {
  students: any[];
  classes: any[];
  currentSearch: string;
  currentClassId: string;
  currentGender: string;
  currentStatus: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  userRole: string;
}

export default function StudentTableClient({
  students,
  classes,
  currentSearch,
  currentClassId,
  currentGender,
  currentStatus,
  totalCount,
  currentPage,
  totalPages,
  userRole,
}: StudentTableClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch);
  const [selectedClass, setSelectedClass] = useState(currentClassId);
  const [selectedGender, setSelectedGender] = useState(currentGender);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const applyFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedClass) params.set('classId', selectedClass);
    if (selectedGender) params.set('gender', selectedGender);
    if (selectedStatus) params.set('status', selectedStatus);

    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });

    router.push(`/students?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search, page: '1' });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedClass('');
    setSelectedGender('');
    setSelectedStatus('');
    router.push('/students');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Student ID, Name, Phone, or Parent Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                applyFilters({ classId: e.target.value, page: '1' });
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                applyFilters({ gender: e.target.value, page: '1' });
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                applyFilters({ status: e.target.value, page: '1' });
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              Search
            </button>

            {(search || selectedClass || selectedGender || selectedStatus) && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{students.length}</strong> of <strong>{totalCount}</strong> students
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Record Synchronized</span>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Student ID</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Primary Parent / Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No student records found</p>
                    <p className="text-[11px]">Try adjusting your search criteria or register a new student.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const primaryParent = student.parents?.find((p: any) => p.isPrimary)?.parent || student.parents?.[0]?.parent;

                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case 'ACTIVE':
                        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'GRADUATED':
                        return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'TRANSFERRED':
                        return 'bg-amber-50 text-amber-700 border-amber-200';
                      case 'WITHDRAWN':
                        return 'bg-rose-50 text-rose-700 border-rose-200';
                      default:
                        return 'bg-slate-50 text-slate-700 border-slate-200';
                    }
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-sky-50/40 transition-colors group"
                    >
                      {/* Student Info & Photo */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/students/${student.id}`}
                          className="flex items-center gap-3 group-hover:text-sky-600 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200 overflow-hidden">
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
                            <span className="font-bold text-slate-900 group-hover:text-sky-600 block">
                              {student.firstName} {student.middleName ? `${student.middleName} ` : ''}{student.lastName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Adm: {formatDate(student.admissionDate)}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-md text-[11px] border border-sky-100">
                          {student.studentId}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {student.currentClass?.name || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {student.currentClass?.category}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-4 text-slate-600">
                        {student.gender}
                      </td>

                      {/* Parent & Phone */}
                      <td className="py-3 px-4">
                        {primaryParent ? (
                          <div>
                            <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                              {primaryParent.fullName} ({primaryParent.relationship})
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {primaryParent.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None recorded</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            student.status
                          )}`}
                        >
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/students/${student.id}`}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-all"
                            title="View 360 Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {(userRole === 'ADMIN' || userRole === 'RECEPTIONIST') && (
                            <Link
                              href={`/students/${student.id}/edit`}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition-all"
                              title="Edit Student"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={`/students/${student.id}/id-card`}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                            title="Student ID Card"
                          >
                            <IdCard className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/students/${student.id}/report-card`}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                            title="Terminal Report Card"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
