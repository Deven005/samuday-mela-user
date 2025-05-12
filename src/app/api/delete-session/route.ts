// app/api/delete-session/route.ts
import { serverAuth, serverMessaging } from '@/app/config/firebase.server.config';
import { clearUserData } from '@/app/utils/utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const idToken = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';

  const { topic, fcmToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: 'No fcmToken provided' }, { status: 400 });
  }

  // Validate ID token
  await serverAuth.verifyIdToken(idToken, true);

  if (fcmToken && topic) {
    await serverMessaging.unsubscribeFromTopic(fcmToken, topic);
  }
  // await serverAuth.revokeRefreshTokens(verifiedUser.sub);
  (await cookies()).delete('session');
  await clearUserData();
  const response = NextResponse.json({ message: 'Session deleted' });
  response.cookies.delete('session'); // Remove session cookie
  return response;
}
