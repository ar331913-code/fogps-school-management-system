import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateNextReceiptNumber } from '@/lib/idGenerator';
import { formatCurrency } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { receiptNumber: { contains: search } },
        { reference: { contains: search } },
        {
          student: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { studentId: { contains: search } },
            ],
          },
        },
      ];
    }

    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: {
            currentClass: true,
          },
        },
        feeStructure: true,
      },
      orderBy: { paymentDate: 'desc' },
      take: 100,
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ACCOUNTANT')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to record payments.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, feeStructureId, amountPaid, paymentMethod, reference, description } = body;

    const parsedAmount = parseFloat(amountPaid);
    if (!studentId || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid student and positive payment amount are required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { studentId }] },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate unique sequential receipt number
    const receiptNumber = await generateNextReceiptNumber();

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.feePayment.create({
        data: {
          receiptNumber,
          studentId: student.id,
          feeStructureId: feeStructureId || null,
          amountPaid: parsedAmount,
          paymentMethod: paymentMethod || 'CASH',
          reference: reference?.trim() || null,
          description: description?.trim() || 'School Fee Payment',
          recordedById: user.id,
          recordedByName: user.fullName,
        },
      });

      await tx.studentHistory.create({
        data: {
          studentId: student.id,
          eventType: 'PAYMENT_RECORDED',
          title: `Payment: ${formatCurrency(parsedAmount)} Recorded`,
          description: `Receipt: ${p.receiptNumber} (${p.paymentMethod}). Desc: ${p.description}.`,
          performedBy: `${user.fullName} (${user.role})`,
        },
      });

      return p;
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'PAYMENT',
      module: 'Fees',
      recordId: payment.id,
      details: `Recorded fee payment of ${formatCurrency(parsedAmount)} for ${student.firstName} ${student.lastName} (Receipt: ${receiptNumber}).`,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}
