// /api/notification/route.ts
import { serverMessaging } from '@/app/config/firebase.server.config';
import { AndroidConfig, WebpushConfig } from 'firebase-admin/messaging';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    const { topic, topics, title, body, image, imageUrl, icon, logo } = reqBody;

    if (!topic && (!topics || (topics as Array<string>).length == 0)) {
      return NextResponse.json({ error: 'No topic provided' }, { status: 400 });
    }

    const android: AndroidConfig = {
      notification: {
        priority: 'high',
        title: title ?? 'notification title',
        body: body ?? 'notification body',
        imageUrl: image ?? imageUrl,
        icon:
          icon ??
          'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
      },
    };
    const webpush: WebpushConfig = {
      headers: {
        Urgency: 'high',
        priority: 'high',
      },
      data: {
        urgent: 'true',
        priority: 'high',
        title: title ?? 'notification title',
        body: body ?? 'notification body',
        imageUrl: image ?? imageUrl ?? '',
        logo:
          logo ??
          'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
      },
      notification: {
        title,
        body,
        icon:
          icon ??
          'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
        image: image ?? imageUrl,
      },
    };

    await serverMessaging.sendEach(
      ((topics ?? [topic]) as Array<string>).map((topic) => ({
        topic,
        android,
        webpush,
      })),
    );
    console.log('Notification is sent!');
    return NextResponse.json({ message: 'Notification is sent!' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json({ error: 'Send Notification failed' }, { status: 401 });
  }
}
