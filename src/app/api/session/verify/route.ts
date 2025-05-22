// app/api/session/verify/route.ts
import { serverAuth } from '@/app/config/firebase.server.config';
import { deleteSession, logoutUser } from '@/app/utils/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const sessionCookie = req.headers.get('session') as string;

    if (!sessionCookie && !idToken)
      return NextResponse.json(
        {
          error: 'No session or token provided',
          valid: false,
        },
        {
          status: 400,
        },
      );

    const decodedToken = await serverAuth.verifySessionCookie(sessionCookie, true);

    if (idToken) {
      const verifiedUser = await serverAuth.verifyIdToken(idToken, true);

      if (verifiedUser.uid !== decodedToken.uid) {
        // return NextResponse.json({ error: 'Not valid user', valid: false }, { status: 401 });
        console.log('Not valid user by uid');
        await deleteSession({ idToken });
        return NextResponse.json(
          { error: { message: 'Not valid user by uid' }, valid: false },
          { status: 401 },
        );
      }
    }

    return NextResponse.json({ valid: true, uid: decodedToken.uid }, { status: 200 });
  } catch (error) {
    await logoutUser({ idToken: idToken! });
    console.error('Session verification failed:', error);
    return NextResponse.json({ error: error, valid: false }, { status: 401 });
  }
}
