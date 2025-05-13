// app/api/auth/logout/route.ts
import { serverMessaging } from '@/app/config/firebase.server.config';
import { clearUserData } from '@/app/utils/utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { origin } = req.nextUrl;

    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    const { fcmTopics, fcmToken } = await req.json();

    const deleteSession = await fetch(`${origin}/api/session/delete`, {
      method: 'POST',
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    });
    const deleteSessionBody = await deleteSession.json();
    console.log('logout deleteSession: ', deleteSession);
    console.log('logout deleteSession: ', deleteSession.ok);
    console.log('logout deleteSession: ', deleteSessionBody);

    if (!deleteSession.ok) {
      throw deleteSessionBody;
    }

    if (fcmToken) {
      if (fcmTopics && fcmTopics.length > 0) {
        for (const topic of fcmTopics) {
          try {
            var res = await serverMessaging.unsubscribeFromTopic(fcmToken, topic);
            console.log(`Unsubscribed from ${topic}:`, res.successCount);
          } catch (err) {
            console.error(`Error unsubscribing from ${topic}:`, err);
          }
        }
      }

      await serverMessaging.unsubscribeFromTopic(fcmToken, deleteSessionBody.uid);
    }

    (await cookies()).delete('session');
    await clearUserData();

    return NextResponse.json({ message: 'Logout is done' }, { status: 200 });
  } catch (error: any) {
    console.log('logout error : ', error);
    return NextResponse.json(
      { message: error.message ?? 'Error while Logout!', error },
      { status: error.status ?? 400 },
    );
  }
}
