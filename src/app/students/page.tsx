import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  IdCard,
  FileText,
  CreditCard,
  GraduationCap,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import StudentTableClient from './StudentTableClient';

export const dynamic = 'force-dynamic';

interface StudentsPageProps {
  searchParams: {
    search?: string;
    classId?: string;
    gender?: string;
    status?: string;
    page?: string;
  };
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const search = searchParams.search?.trim() || '';
  const classId = searchParams.classId || '';
  const gender = searchParams.gender || '';
  const status = searchParams.status || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build Prisma query
  const whereClause: any = {};
  if (classId) whereClause.currentClassId = classId;
  if (gender) whereClause.gender = gender;
  if (status) whereClause.status = status;

  if (search) {
    whereClause.OR = [
      { studentId: { contains: search } },
      { firstName: { contains: search } },
      { middleName: { contains: search } },
      { lastName: { contains: search } },
      { phone: { contains: search } },
      {
        parents: {
          some: {
            parent: {
              OR: [
                { fullName: { contains: search } },
                { phone: { contains: search } },
              ],
            },
          },
        },
      },
    ];
  }

  const [totalStudents, students, classes] = await Promise.all([
    prisma.student.count({ where: whereClause }),
    prisma.student.findMany({
      where: whereClause,
      include: {
        currentClass: true,
        parents: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.class.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalStudents / limit);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Student Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage, search, and view all student profiles in Full of Grace Preparatory School
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(user.role === 'ADMIN' || user.role === 'RECEPTIONIST') && (
            <Link
              href="/students/register"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Student</span>
            </Link>
          )}
        </div>
      </div>

      {/* Client Filter & Table Component */}
      <StudentTableClient
        students={students}
        classes={classes}
        currentSearch={search}
        currentClassId={classId}
        currentGender={gender}
        currentStatus={status}
        totalCount={totalStudents}
        currentPage={page}
        totalPages={totalPages}
        userRole={user.role}
      />
    </div>
  );
}
