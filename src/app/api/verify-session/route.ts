// app/api/verify-session/route.ts
import { serverAuth, serverFirestore } from '@/app/config/firebase.server.config';
import { clearUserData } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.headers.get('session') as string;
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');

    // console.log('verify-session headers: ', req.headers);

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
        await clearUserData();

        const res = NextResponse.json(
          { error: { message: 'Not valid user by uid' }, valid: false },
          { status: 401 },
        );
        res.cookies.delete('session');
        return res;
      }
    }

    return NextResponse.json({ valid: true, uid: decodedToken.uid }, { status: 200 });
  } catch (error) {
    await clearUserData();
    console.error('Session verification failed:', error);
    return NextResponse.json({ error: error, valid: false }, { status: 401 });
    // throw error;
  }
}
