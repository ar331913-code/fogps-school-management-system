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
    const {
      fullName,
      relationship,
      phone,
      alternativePhone,
      email,
      occupation,
      residentialAddress,
      digitalAddress,
      isEmergencyContact,
      isPrimary,
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'Parent full name and phone number are required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const parent = await tx.parentGuardian.create({
        data: {
          fullName: fullName.trim(),
          relationship: relationship || 'Guardian',
          phone: phone.trim(),
          alternativePhone: alternativePhone?.trim() || null,
          email: email?.trim() || null,
          occupation: occupation?.trim() || null,
          residentialAddress: residentialAddress?.trim() || null,
          digitalAddress: digitalAddress?.trim() || null,
          isEmergencyContact: Boolean(isEmergencyContact),
        },
      });

      const link = await tx.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          isPrimary: Boolean(isPrimary),
        },
      });

      await tx.studentHistory.create({
        data: {
          studentId: student.id,
          eventType: 'PROFILE_UPDATED',
          title: 'Parent/Guardian Added',
          description: `Added ${parent.relationship}: ${parent.fullName} (${parent.phone}).`,
          performedBy: `${user.fullName} (${user.role})`,
        },
      });

      return { parent, link };
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Students',
      recordId: student.id,
      details: `Added parent/guardian ${fullName} to student ${student.firstName} ${student.lastName}.`,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Add parent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add parent/guardian.' },
      { status: 500 }
    );
  }
}
