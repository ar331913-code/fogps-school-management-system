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
    const { title, documentType, fileUrl, fileSize } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Document title is required.' },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { studentId: id }] },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const doc = await prisma.studentDocument.create({
      data: {
        studentId: student.id,
        title: title.trim(),
        documentType: documentType || 'OTHER',
        fileUrl: fileUrl || '/sample-document.pdf',
        fileSize: fileSize || '320 KB',
      },
    });

    await prisma.studentHistory.create({
      data: {
        studentId: student.id,
        eventType: 'PROFILE_UPDATED',
        title: 'Document Uploaded',
        description: `Uploaded "${doc.title}" (${doc.documentType}).`,
        performedBy: `${user.fullName} (${user.role})`,
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'CREATE',
      module: 'Documents',
      recordId: doc.id,
      details: `Uploaded document "${doc.title}" for student ${student.firstName} ${student.lastName}`,
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error: any) {
    console.error('Upload doc error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to attach document.' },
      { status: 500 }
    );
  }
}
