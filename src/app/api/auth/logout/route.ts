import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await logAudit({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action: 'LOGOUT',
        module: 'Auth',
        recordId: user.id,
        details: `User ${user.fullName} logged out.`,
      });
    }

    const cookieStore = cookies();
    cookieStore.delete('fogps_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
