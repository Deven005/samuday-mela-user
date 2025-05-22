// /api/notification/route.ts
import { serverMessaging } from '@/app/config/firebase.server.config';
import { Message } from 'firebase-admin/messaging';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Ensure this runs in Node.js

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    const { topic, title, body, image, imageUrl, icon, logo } = reqBody;

    if (!topic) {
      return NextResponse.json({ error: 'No topic provided' }, { status: 400 });
    }

    await serverMessaging.send({
      topic: topic,
      android: {
        notification: {
          priority: 'high',
          title: title ?? 'notification title',
          body: body ?? 'notification body',
          imageUrl: image ?? imageUrl,
          icon:
            icon ??
            'https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237',
        },
      },
      webpush: {
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
      },
    });
    console.log('Notification is sent!');
    return NextResponse.json({ message: 'Notification is sent!' }, { status: 200 });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json({ error: 'Send Notification failed' }, { status: 401 });
  }
}
