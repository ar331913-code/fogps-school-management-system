import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      maxAge: 60 * 60 * 24 * 7,
    });

    await logAudit({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'LOGIN',
      module: 'Auth',
      recordId: user.id,
      details: `Fast switched to user role ${user.role} (${user.username}).`,
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: 'Switch failed' }, { status: 500 });
  }
}
