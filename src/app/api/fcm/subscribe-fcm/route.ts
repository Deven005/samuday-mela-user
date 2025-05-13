// api/fcm/subscribe-fcm
import { serverMessaging } from '@/app/config/firebase.server.config';
import { messaging } from 'firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token, topic } = await req.json();

  if (!token || !topic) {
    return NextResponse.json({ error: 'Missing token or topic', success: false }, { status: 400 });
  }

  try {
    const messSubscribe = await messaging().subscribeToTopic(token, topic);

    if (messSubscribe.errors.length > 0) throw messSubscribe.errors;

    const fcmRes = await serverMessaging.sendEach(
      [
        {
          token,
          notification: {
            title: 'testing token',
            body: 'testing token',
          },
        },
        {
          topic,
          notification: {
            title: 'testing topic',
            body: 'testing topic',
          },
        },
      ],
      true,
    );

    if (fcmRes.failureCount > 0) throw fcmRes.responses.map((e) => e.error);

    return NextResponse.json({ message: 'Subscribed to topic!', success: true }, { status: 200 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe', success: false }, { status: 500 });
  }
}
