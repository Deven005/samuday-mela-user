// api/fcm/subscribe-fcm
import { serverMessaging } from '@/app/config/firebase.server.config';
import { messaging } from 'firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token, topic } = await req.json();

  console.log('fcm-subscribe post called!');
  console.log('subscribe-fcm token: ', token);
  console.log('subscribe-fcm topic: ', topic);

  if (!token || !topic) {
    return NextResponse.json({ error: 'Missing token or topic', success: false }, { status: 400 });
  }

  try {
    const messSubscribe = await messaging().subscribeToTopic(token, topic);
    console.log(messSubscribe.successCount, messSubscribe.failureCount, messSubscribe.errors);

    console.log('subscribe-fcm messSubscribe.successCount: ', messSubscribe.successCount);
    console.log('subscribe-fcm messSubscribe.failureCount: ', messSubscribe.failureCount);
    console.log('subscribe-fcm messSubscribe.errors: ', messSubscribe.errors);

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

    console.log('fcmRes: ', fcmRes);
    console.log('subscribe-fcm messSubscribe.successCount: ', fcmRes.successCount);
    console.log('subscribe-fcm messSubscribe.failureCount: ', fcmRes.failureCount);
    console.log('subscribe-fcm messSubscribe.responses: ', fcmRes.responses[0]);

    if (fcmRes.failureCount > 0) throw fcmRes.responses.map((e) => e.error);

    return NextResponse.json({ message: 'Subscribed to topic!', success: true }, { status: 200 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe', success: false }, { status: 500 });
  }
}
