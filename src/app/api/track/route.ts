import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { path = '/', referrer = 'Direct' } = await request.json().catch(() => ({}));

    // Extract visitor IP address
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = cfConnectingIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';

    // Parse user agent to human-readable device and browser
    const ua = request.headers.get('user-agent') || 'Unknown Device';
    let device = 'Desktop PC';
    if (/android/i.test(ua)) device = 'Android Mobile';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Apple Device';
    else if (/macintosh|mac os x/i.test(ua)) device = 'Apple Mac';
    else if (/windows/i.test(ua)) device = 'Windows PC';
    else if (/linux/i.test(ua)) device = 'Linux Machine';

    let browser = 'Web Browser';
    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';

    // Check if staff user is currently logged in
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('fogps_session')?.value;
    let userId: string | null = null;
    let userName = 'Guest Visitor';
    let userRole = 'VISITOR';

    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf-8'));
        if (decoded?.id) {
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, fullName: true, role: true, username: true },
          });
          if (user) {
            userId = user.id;
            userName = `${user.fullName} (@${user.username})`;
            userRole = user.role;
          }
        }
      } catch {
        // Fallback to Guest Visitor if session invalid
      }
    }

    // Deduplicate rapid consecutive reloads on the same path within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentLog = await prisma.auditLog.findFirst({
      where: {
        action: 'VISIT',
        recordId: ip,
        createdAt: { gte: thirtySecondsAgo },
        details: {
          contains: `Visited page "${path}"`,
        },
      },
    });

    if (recentLog) {
      return NextResponse.json({ success: true, deduped: true });
    }

    // Write visitor entrance log
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        userRole,
        action: 'VISIT',
        module: 'WebsiteAccess',
        recordId: ip,
        details: `Visited page "${path}" from IP [${ip}] using ${browser} on ${device}.${referrer && referrer !== 'Direct' ? ` (Referred from: ${referrer})` : ''}`,
      },
    });

    return NextResponse.json({ success: true, logged: true });
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
