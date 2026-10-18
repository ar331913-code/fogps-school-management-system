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

    const feeStructures = await prisma.feeStructure.findMany({
      include: {
        class: true,
        academicYear: true,
        term: true,
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ feeStructures });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch fee structures' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, classId, academicYearId, termId, amount, dueDate } = body;

    if (!name || !classId || !amount) {
      return NextResponse.json(
        { error: 'Fee name, class, and amount are required.' },
        { status: 400 }
      );
    }

    // Default year/term if missing
    let yearId = academicYearId;
    let tId = termId;
    if (!yearId || !tId) {
      const settings = await prisma.schoolSettings.findUnique({
        where: { id: 'settings_primary' },
      });
      yearId = yearId || settings?.currentAcademicYearId;
      tId = tId || settings?.currentTermId;
    }

    const structure = await prisma.feeStructure.create({
      data: {
        name: name.trim(),
        classId,
        academicYearId: yearId,
        termId: tId,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { class: true },
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Fees',
      recordId: structure.id,
      details: `Created fee structure "${structure.name}" (GH₵ ${structure.amount}) for ${structure.class.name}`,
    });

    return NextResponse.json({ success: true, feeStructure: structure });
  } catch (error: any) {
    console.error('Create fee structure error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create fee item' }, { status: 500 });
  }
}
