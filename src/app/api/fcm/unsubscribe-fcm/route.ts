// api/fcm/unsubscribe-fcm
import { serverMessaging } from '@/app/config/firebase.server.config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token, topic } = await req.json();

  try {
    if (!token || !topic) {
      return NextResponse.json({ error: 'No token or topic provided!' }, { status: 400 });
    }

    await serverMessaging.unsubscribeFromTopic(token, topic);
    await serverMessaging.unsubscribeFromTopic(token, 'global');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
