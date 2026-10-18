import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classes = await prisma.class.findMany({
      include: {
        teachers: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        _count: {
          select: {
            students: { where: { status: 'ACTIVE' } },
            classSubjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ classes });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, capacity, teacherId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Class name is required.' }, { status: 400 });
    }

    const exists = await prisma.class.findUnique({ where: { name: name.trim() } });
    if (exists) {
      return NextResponse.json({ error: `Class "${name}" already exists.` }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        category: category || 'Primary',
        capacity: capacity ? parseInt(capacity, 10) : 40,
      },
    });

    if (teacherId) {
      await prisma.user.update({
        where: { id: teacherId },
        data: { teacherClassId: newClass.id },
      });
    }

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Classes',
      recordId: newClass.id,
      details: `Created new class "${newClass.name}" (${newClass.category}).`,
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create class' }, { status: 500 });
  }
}
