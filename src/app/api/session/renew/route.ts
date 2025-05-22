import { serverAuth } from '@/app/config/firebase.server.config';
import { deleteSession } from '@/app/utils/auth/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.headers.get('session') as string;
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
    const { origin } = req.nextUrl;
    // const { sessionCookie, idToken } = await req.json();
    console.log('renew-session body: ', await req.json());

    console.log('renew-session body: ', sessionCookie);
    console.log('renew-session body: ', idToken);

    // 1️⃣ First, check session cookie if it's still valid
    if (sessionCookie) {
      try {
        await serverAuth.verifySessionCookie(sessionCookie, true);
      } catch (error: any) {
        if (error.code === 'auth/session-cookie-expired') {
          await deleteSession({ idToken });
        }
      }
    }
    // 2️⃣ If session expired, require fresh ID token
    else if (idToken) {
      await serverAuth.verifyIdToken(idToken, true);
    } else {
      return NextResponse.json({ error: 'No session or ID token provided' }, { status: 401 });
    }

    // Generate a new session cookie if needed
    const expiresIn = 1000 * 60 * 60 * 24 * 7;
    const newSessionCookie = await serverAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ message: 'Session refreshed' });
    (await cookies()).set('session', newSessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
    });
    return response;
  } catch (error) {
    console.error('Session renewal failed:', error);
    return NextResponse.json({ error: 'Session renewal failed' }, { status: 401 });
  }
}
