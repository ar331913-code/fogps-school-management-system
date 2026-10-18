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

    const [years, subjects, settings] = await Promise.all([
      prisma.academicYear.findMany({
        include: { terms: true },
        orderBy: { name: 'desc' },
      }),
      prisma.subject.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.schoolSettings.findUnique({
        where: { id: 'settings_primary' },
      }),
    ]);

    return NextResponse.json({ years, subjects, settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch academic data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, name, code, isCore, description, yearId, termId } = body;

    // 1. Create Academic Year
    if (action === 'CREATE_YEAR') {
      if (!name) return NextResponse.json({ error: 'Year name is required' }, { status: 400 });
      const year = await prisma.academicYear.create({
        data: { name: name.trim() },
      });
      // Automatically add 3 standard terms
      await prisma.term.createMany({
        data: [
          { name: 'First Term', academicYearId: year.id },
          { name: 'Second Term', academicYearId: year.id },
          { name: 'Third Term', academicYearId: year.id },
        ],
      });
      return NextResponse.json({ success: true, year });
    }

    // 2. Set Active Academic Year / Term
    if (action === 'SET_ACTIVE_YEAR') {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
      await prisma.academicYear.update({
        where: { id: yearId },
        data: { isCurrent: true },
      });

      await prisma.schoolSettings.update({
        where: { id: 'settings_primary' },
        data: { currentAcademicYearId: yearId },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'SET_ACTIVE_TERM') {
      await prisma.term.updateMany({ data: { isCurrent: false } });
      await prisma.term.update({
        where: { id: termId },
        data: { isCurrent: true },
      });

      await prisma.schoolSettings.update({
        where: { id: 'settings_primary' },
        data: { currentTermId: termId },
      });

      return NextResponse.json({ success: true });
    }

    // 3. Create Subject
    if (action === 'CREATE_SUBJECT') {
      if (!name || !code) return NextResponse.json({ error: 'Subject name and code are required' }, { status: 400 });
      const subject = await prisma.subject.create({
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          isCore: Boolean(isCore),
          description: description?.trim() || null,
        },
      });

      // Link to all classes
      const classes = await prisma.class.findMany({ select: { id: true } });
      for (const c of classes) {
        await prisma.classSubject.create({
          data: { classId: c.id, subjectId: subject.id },
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, subject });
    }

    return NextResponse.json({ error: 'Invalid academic action' }, { status: 400 });
  } catch (error: any) {
    console.error('Academic API error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
