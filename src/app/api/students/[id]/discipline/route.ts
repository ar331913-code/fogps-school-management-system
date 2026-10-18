import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, actionTaken, status, incidentDate } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const record = await prisma.disciplineRecord.create({
      data: {
        studentId: student.id,
        title: title.trim(),
        description: description.trim(),
        actionTaken: actionTaken?.trim() || null,
        status: status || 'Resolved',
        incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
        recordedBy: `${user.fullName} (${user.role})`,
      },
    });

    await prisma.studentHistory.create({
      data: {
        studentId: student.id,
        eventType: 'DISCIPLINE',
        title: `Discipline/Remark: ${record.title}`,
        description: `${record.description}. Action: ${record.actionTaken || 'None'}.`,
        performedBy: `${user.fullName} (${user.role})`,
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Students',
      recordId: record.id,
      details: `Added discipline record "${record.title}" for student ${student.firstName} ${student.lastName}`,
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error('Discipline log error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record discipline entry.' },
      { status: 500 }
    );
  }
}
