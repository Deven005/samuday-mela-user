// app/api/session/create/route.ts
import { serverAuth, serverFirestore } from '@/app/config/firebase.server.config';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { formatLocalDate, getDistanceFromLatLonInKm } from '@/app/utils/utils';
import { cookies } from 'next/headers';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const { origin } = req.nextUrl;

    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!idToken) {
      // return NextResponse.json({ error: 'Not valid id token provided' }, { status: 400 });
      throw new Error('Not valid id token provided');
    }

    // Validate ID token
    const verifiedUser = await serverAuth.verifyIdToken(idToken, true);

    // Only process if the user just signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - verifiedUser.auth_time >= 5 * 60)
      throw Error('Recent sign in required!');

    // Create a session cookie (valid for 7 days)
    const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
    const sessionCookie = await serverAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const ip = origin.includes('localhost')
      ? '152.59.23.76'
      : req.headers.get('x-forwarded-for')?.toString().split(',')[0] || null;

    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();
    console.log('geo: ', geo);

    if (geo.error != true) {
      const loginRef = serverFirestore.collection(`userLogins`);
      const loginUserRef = loginRef.where('uid', '==', verifiedUser.uid);

      // 1. Device fingerprint
      const deviceHash = createHash('sha256')
        .update(`${geo.ip}-${req.headers.get('user-agent') || ''}`)
        .digest('hex');

      const snapshot = await loginUserRef
        .where('deviceHash', '==', deviceHash)
        // .where('ip', '==', geo.ip)
        .where('country_name', '==', geo.country_name)
        .where('region', '==', geo.region)
        .where('postal', '==', geo.postal)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      const isNewLocation = snapshot.empty;

      // 3. Check distance from last login (optional)
      const previousSnapshot = await loginUserRef.orderBy('timestamp', 'desc').limit(1).get();
      const previousData = previousSnapshot.docs[0]?.data();
      let distanceKm = 0;

      if (previousData?.latitude && previousData?.longitude) {
        distanceKm = getDistanceFromLatLonInKm(
          previousData.latitude,
          previousData.longitude,
          geo.latitude,
          geo.longitude,
        );
      }

      // 4. If login is suspicious
      const isSuspicious = isNewLocation || distanceKm > 100;

      if (isSuspicious) {
        const now = Timestamp.now();
        // Store new login location
        await loginRef.add({
          ...geo,
          uid: verifiedUser.uid,
          userAgent: req.headers.get('user-agent') || '',
          timestamp: now,
        });

        // Optionally send a notification if it's not the first ever login
        const totalLogins = await loginUserRef.get();
        const isFirstLogin = totalLogins.size === 1;

        if (!isFirstLogin) {
          const notificationRes = await fetch(`${origin}/api/notification`, {
            method: 'POST',
            // headers: {
            //   'Content-Type': 'application/json',
            //   Authorization: req.headers.get('Authorization')?.replace('Bearer ', '') ?? '',
            //   session: sessionCookie,
            // },
            body: JSON.stringify({
              topic: verifiedUser.uid,
              title: '⚠️🔐 New Login Detected!',
              body: `Your account was accessed from ${geo.city}, ${geo.region}, ${geo.country_name} at ${formatLocalDate(
                now.toDate(),
                geo.timezone || 'UTC',
              )}.`,
            }),
          });
          console.log('notificationRes: ', notificationRes);
          console.log('notificationRes: ', notificationRes.ok);
          console.log('notificationRes: ', await notificationRes.json());
        }
      }
    }

    (await cookies()).set('session', sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: expiresIn,
    });

    return NextResponse.json({ message: 'Session created' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: error }, { status: error.status ?? 401 });
  }
}
