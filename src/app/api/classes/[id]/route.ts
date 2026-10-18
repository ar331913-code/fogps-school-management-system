import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        teachers: true,
        students: {
          orderBy: { firstName: 'asc' },
          include: {
            parents: { include: { parent: true } },
          },
        },
        classSubjects: {
          include: { subject: true },
        },
        feeStructures: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch class details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, category, capacity, teacherId } = body;

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        category: category || undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
      },
    });

    if (teacherId !== undefined) {
      // Clear previous assignment
      await prisma.user.updateMany({
        where: { teacherClassId: id },
        data: { teacherClassId: null },
      });

      if (teacherId) {
        await prisma.user.update({
          where: { id: teacherId },
          data: { teacherClassId: id },
        });
      }
    }

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Classes',
      recordId: updated.id,
      details: `Updated class info for "${updated.name}".`,
    });

    return NextResponse.json({ success: true, class: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    // Check if students exist in this class
    const studentCount = await prisma.student.count({
      where: { currentClassId: id },
    });

    if (studentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete class. There are currently ${studentCount} students enrolled. Reassign all students before deleting this class.`,
        },
        { status: 400 }
      );
    }

    const deleted = await prisma.class.delete({ where: { id } });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'DELETE',
      module: 'Classes',
      recordId: deleted.id,
      details: `Deleted empty class "${deleted.name}".`,
    });

    return NextResponse.json({ success: true, message: 'Class deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete class' }, { status: 500 });
  }
}
