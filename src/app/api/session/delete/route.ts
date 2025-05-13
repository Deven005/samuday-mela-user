// app/api/session/delete/route.ts
import { serverAuth } from '@/app/config/firebase.server.config';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

  if (!idToken) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    // Validate ID token
    const verifiedUser = await serverAuth.verifyIdToken(idToken, true);

    // await serverAuth.revokeRefreshTokens(verifiedUser.sub);
    (await cookies()).delete('session');
    const response = NextResponse.json(
      { message: 'Session deleted', uid: verifiedUser.uid },
      { status: 200 },
    );
    return response;
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      {
        message: 'Failed to delete session',
        error: (error as Error).message || 'Unknown error',
      },
      { status: 400 },
    );
  }
}
