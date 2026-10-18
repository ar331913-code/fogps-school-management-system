import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        teacherClassId: true,
        assignedClass: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, fullName, email, phone, role, teacherClassId } = body;

    if (!username || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Username, password, full name, and role are required.' },
        { status: 400 }
      );
    }

    // Role validation (Admin, Teacher, Accountant, Receptionist)
    const validRoles = ['ADMIN', 'TEACHER', 'ACCOUNTANT', 'RECEPTIONIST'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: ADMIN, TEACHER, ACCOUNTANT, RECEPTIONIST' },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { username: username.trim() },
    });
    if (exists) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        passwordHash,
        fullName: fullName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        role,
        teacherClassId: role === 'TEACHER' ? teacherClassId || null : null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATE',
      module: 'Auth',
      recordId: newUser.id,
      details: `Created new staff account for ${newUser.fullName} (${newUser.role}, username: ${newUser.username}).`,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user account' }, { status: 500 });
  }
}
