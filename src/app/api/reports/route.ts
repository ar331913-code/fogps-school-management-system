import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'students';
    const classId = searchParams.get('classId');

    if (type === 'students') {
      const where: any = {};
      if (classId) where.currentClassId = classId;

      const students = await prisma.student.findMany({
        where,
        include: { currentClass: true, parents: { include: { parent: true } } },
        orderBy: { firstName: 'asc' },
      });

      return NextResponse.json({ data: students });
    }

    if (type === 'debtors') {
      const students = await prisma.student.findMany({
        where: { status: 'ACTIVE' },
        include: {
          currentClass: { include: { feeStructures: true } },
          payments: true,
          parents: { include: { parent: true } },
        },
      });

      const debtors = students
        .map((s) => {
          const totalAssigned = s.currentClass.feeStructures.reduce(
            (sum, f) => sum + f.amount,
            0
          );
          const totalPaid = s.payments.reduce((sum, p) => sum + p.amountPaid, 0);
          const balance = Math.max(0, totalAssigned - totalPaid);
          const parent = s.parents?.[0]?.parent;

          return {
            id: s.id,
            studentId: s.studentId,
            name: `${s.firstName} ${s.lastName}`,
            className: s.currentClass.name,
            totalAssigned,
            totalPaid,
            balance,
            parentName: parent?.fullName || 'N/A',
            parentPhone: parent?.phone || 'N/A',
          };
        })
        .filter((d) => d.balance > 0);

      return NextResponse.json({ data: debtors });
    }

    if (type === 'attendance_summary') {
      const classes = await prisma.class.findMany({
        include: {
          students: { where: { status: 'ACTIVE' } },
          attendances: true,
        },
      });

      const summary = classes.map((c) => {
        const totalSessions = c.attendances.length;
        const presentCount = c.attendances.filter(
          (a) => a.status === 'PRESENT' || a.status === 'LATE'
        ).length;
        const rate =
          totalSessions > 0
            ? Math.round((presentCount / totalSessions) * 100)
            : 100;

        return {
          classId: c.id,
          className: c.name,
          category: c.category,
          studentCount: c.students.length,
          totalLogged: totalSessions,
          rate,
        };
      });

      return NextResponse.json({ data: summary });
    }

    return NextResponse.json({ data: [] });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
