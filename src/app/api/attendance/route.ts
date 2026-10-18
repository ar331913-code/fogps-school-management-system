import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 });
    }

    // Fetch active students in class
    const students = await prisma.student.findMany({
      where: { currentClassId: classId, status: 'ACTIVE' },
      select: { id: true, studentId: true, firstName: true, lastName: true, gender: true },
      orderBy: { firstName: 'asc' },
    });

    // Fetch existing attendance records for date
    const attendances = await prisma.attendance.findMany({
      where: { classId, date },
    });

    const attendanceMap = new Map();
    attendances.forEach((a) => attendanceMap.set(a.studentId, a));

    const rosterWithAttendance = students.map((st) => {
      const existing = attendanceMap.get(st.id);
      return {
        studentId: st.id,
        admissionId: st.studentId,
        studentName: `${st.firstName} ${st.lastName}`,
        gender: st.gender,
        status: existing ? existing.status : 'PRESENT',
        remarks: existing ? existing.remarks || '' : '',
        attendanceId: existing?.id || null,
      };
    });

    return NextResponse.json({
      date,
      classId,
      records: rosterWithAttendance,
      summary: {
        total: students.length,
        present: attendances.filter((a) => a.status === 'PRESENT').length,
        late: attendances.filter((a) => a.status === 'LATE').length,
        absent: attendances.filter((a) => a.status === 'ABSENT').length,
        excused: attendances.filter((a) => a.status === 'EXCUSED').length,
      },
    });
  } catch (error: any) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Admin and Teacher can record attendance
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Forbidden: Only teachers and admins can record attendance.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { classId, date, records, academicYearId, termId } = body;

    if (!classId || !date || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid attendance submission payload.' },
        { status: 400 }
      );
    }

    // Get active year and term if not provided
    let yearId = academicYearId;
    let tId = termId;

    if (!yearId || !tId) {
      const settings = await prisma.schoolSettings.findUnique({
        where: { id: 'settings_primary' },
      });
      yearId = yearId || settings?.currentAcademicYearId;
      tId = tId || settings?.currentTermId;
    }

    // Upsert each record
    await prisma.$transaction(
      records.map((rec: { studentId: string; status: string; remarks?: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: rec.studentId,
              date,
            },
          },
          update: {
            status: rec.status || 'PRESENT',
            remarks: rec.remarks || null,
            recordedById: user.id,
          },
          create: {
            studentId: rec.studentId,
            classId,
            date,
            status: rec.status || 'PRESENT',
            academicYearId: yearId,
            termId: tId,
            remarks: rec.remarks || null,
            recordedById: user.id,
          },
        })
      )
    );

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Attendance',
      details: `Saved attendance for Class ID ${classId} on ${date} (${records.length} students processed).`,
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance saved successfully.',
    });
  } catch (error: any) {
    console.error('Save attendance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save attendance.' },
      { status: 500 }
    );
  }
}
