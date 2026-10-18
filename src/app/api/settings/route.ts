import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const settings = await prisma.schoolSettings.findUnique({
      where: { id: 'settings_primary' },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.schoolSettings.upsert({
      where: { id: 'settings_primary' },
      update: {
        schoolName: body.schoolName,
        motto: body.motto,
        address: body.address,
        digitalAddress: body.digitalAddress,
        phone: body.phone,
        email: body.email,
        website: body.website,
        logoUrl: body.logoUrl,
        idPrefix: body.idPrefix,
        receiptPrefix: body.receiptPrefix,
        gradingScheme: body.gradingScheme,
      },
      create: {
        id: 'settings_primary',
        schoolName: body.schoolName || 'FULL OF GRACE PREPARATORY SCHOOL',
        motto: body.motto || 'Excellence, Discipline and Grace',
        address: body.address || 'P.O. Box 123, Accra, Ghana',
        digitalAddress: body.digitalAddress || 'GA-123-4567',
        phone: body.phone || '+233 24 000 0000',
        email: body.email || 'info@fullofgraceprep.edu.gh',
      },
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'UPDATE',
      module: 'Settings',
      details: 'Updated global school settings and grading parameters.',
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
