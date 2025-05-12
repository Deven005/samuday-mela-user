// app/api/create-session/route.ts
import { serverAuth } from '@/app/config/firebase.server.config';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log('/create-session req.headers: ', req.headers);
    console.log('/create-session idToken: ', idToken);

    if (!idToken) {
      // return NextResponse.json({ error: 'Not valid id token provided' }, { status: 400 });
      throw new Error('Not valid id token provided');
    }

    // Validate ID token
    const verifiedToken = await serverAuth.verifyIdToken(idToken, true);

    // Only process if the user just signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - verifiedToken.auth_time >= 5 * 60)
      throw Error('Recent sign in required!');

    // Create a session cookie (valid for 7 days)
    const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
    const sessionCookie = await serverAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    console.log('/create-session verifiedToken.uid: ', verifiedToken.uid);

    const response = NextResponse.json({ message: 'Session created' }, { status: 200 });
    response.cookies.set('session', sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
    });

    return response;
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: error }, { status: 401 });
  }
}
