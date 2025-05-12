// app/utils/getFCMToken.ts
import { getToken } from 'firebase/messaging';
import { auth, messaging } from '../config/firebase.config';
import { fetchWithAppCheck } from './generateAppCheckToken';

interface SendNotificationType {
  topic: string;
  title: string;
  body: string;
  imageUrl?: string;
}

export const sendNotification = async ({ topic, title, body, imageUrl }: SendNotificationType) => {
  await fetchWithAppCheck('/api/notification', (await auth.currentUser?.getIdToken()) ?? '', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      title,
      body,
      imageUrl,
    }),
    // headers: { 'Content-Type': 'application/json' },
  });
};

// Somewhere global or at the top-level in your FCM logic
let swRegistration: ServiceWorkerRegistration | null = null;

export async function getFCMToken(
  fcmToken: string | undefined,
  forceNewToken?: boolean | undefined,
) {
  try {
    if (!swRegistration) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;
      console.log('Service Worker registered:', swRegistration.scope);
    }

    if (fcmToken && !forceNewToken) {
      return fcmToken;
    }

    return await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_VAPID_KEY, // ✅ Stored securely in .env
      serviceWorkerRegistration: swRegistration,
    });

    // await fetchWithAppCheck(
    //   '/api/fcm/subscribe-fcm',
    //   (await auth.currentUser?.getIdToken()) ?? '',
    //   {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       token: newFcmToken,
    //       topic: auth.currentUser?.uid,
    //     }),
    //     // headers: { 'Content-Type': 'application/json' },
    //   },
    // );

    // return newFcmToken;
  } catch (error) {
    console.warn('Error getting FCM token:', error);
    // return new Error(`error fcm token : ${error}`);
    return null;
  }
}
