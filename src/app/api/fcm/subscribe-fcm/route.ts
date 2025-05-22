// api/fcm/subscribe-fcm
import { subscribeToFcmTopicServerSide } from '../../../utils/fcm/fcm-server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token, topic } = await req.json();

  if (!token || !topic) {
    return NextResponse.json({ error: 'Missing token or topic', success: false }, { status: 400 });
  }

  try {
    await subscribeToFcmTopicServerSide({ tokens: [token], topic });
    await subscribeToFcmTopicServerSide({ tokens: [token], topic: 'global' });
    return NextResponse.json({ message: 'Subscribed to topic!', success: true }, { status: 200 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe', success: false }, { status: 500 });
  }
}
