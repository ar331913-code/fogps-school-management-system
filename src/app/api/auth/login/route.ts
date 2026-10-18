import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username } },
          { email: { equals: username } },
        ],
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const sessionPayload = Buffer.from(
      JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
      })
    ).toString('base64');

    const cookieStore = cookies();
    cookieStore.set('fogps_session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'LOGIN',
      module: 'Auth',
      recordId: user.id,
      details: `User ${user.fullName} (${user.role}) logged in successfully.`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
