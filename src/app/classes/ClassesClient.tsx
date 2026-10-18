'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface ClassesClientProps {
  classes: any[];
  teachers: any[];
  userRole: string;
}

export default function ClassesClient({
  classes,
  teachers,
  userRole,
}: ClassesClientProps) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<any>(classes[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    category: 'Primary',
    capacity: '40',
    teacherId: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');
      setSuccess('Class created successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update class');
      setSuccess('Class updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete class "${className}"?`)) return;
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete class');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Class Management & Rosters
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic classes from Creche to JHS 3 and view student lists
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={() => {
              setForm({ name: '', category: 'Primary', capacity: '40', teacherId: '' });
              setError('');
              setSuccess('');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Class</span>
          </button>
        )}
      </div>

      {/* Main Grid: Class List Sidebar & Selected Class Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Classes List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            School Classes ({classes.length})
          </h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {classes.map((cls) => {
              const active = selectedClass?.id === cls.id;
              const assignedTeacher = cls.teachers?.[0];

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    active
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                      : 'bg-white text-slate-800 border-slate-200/80 hover:border-sky-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {cls.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">{cls.name}</h3>
                      <p
                        className={`text-[11px] ${
                          active ? 'text-sky-100' : 'text-slate-500'
                        }`}
                      >
                        {assignedTeacher ? `Teacher: ${assignedTeacher.fullName}` : 'No teacher assigned'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cls.students?.length || 0} students
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Class Roster & Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedClass ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {selectedClass.name} Roster
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                      {selectedClass.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class Teacher: <strong>{selectedClass.teachers?.[0]?.fullName || 'Not assigned'}</strong> • Capacity: <strong>{selectedClass.capacity}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/attendance?classId=${selectedClass.id}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-200"
                  >
                    Attendance
                  </Link>

                  {userRole === 'ADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          setForm({
                            name: selectedClass.name,
                            category: selectedClass.category,
                            capacity: String(selectedClass.capacity),
                            teacherId: selectedClass.teachers?.[0]?.id || '',
                          });
                          setError('');
                          setSuccess('');
                          setShowEditModal(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs"
                        title="Edit Class"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedClass.id, selectedClass.name)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Student Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedClass.students?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-600">No students currently enrolled in {selectedClass.name}</p>
                          <p className="text-[11px] mt-1">Register a new student or assign existing students to this class.</p>
                        </td>
                      </tr>
                    ) : (
                      selectedClass.students?.map((st: any, idx: number) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">
                            <Link href={`/students/${st.id}`} className="hover:text-sky-600">
                              {st.firstName} {st.lastName}
                            </Link>
                          </td>
                          <td className="p-3 font-mono font-semibold text-sky-700">{st.studentId}</td>
                          <td className="p-3 text-slate-600">{st.gender}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              {st.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              href={`/students/${st.id}`}
                              className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                            >
                              360 Profile
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              Select a class from the left sidebar to view its roster.
            </div>
          )}
        </div>

      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New School Class</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}
            {success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{success}</div>}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary 7 or Pre-School"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  <option value="Nursery">Nursery / Creche</option>
                  <option value="KG">Kindergarten (KG)</option>
                  <option value="Primary">Primary</option>
                  <option value="JHS">Junior High School (JHS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Class Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  <option value="">None / Assign Later</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {loading ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Class Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}
            {success && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">{success}</div>}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  <option value="Nursery">Nursery / Creche</option>
                  <option value="KG">Kindergarten (KG)</option>
                  <option value="Primary">Primary</option>
                  <option value="JHS">Junior High School (JHS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Class Teacher</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                >
                  <option value="">None</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
