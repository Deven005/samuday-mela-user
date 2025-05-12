'use client';
import { useEffect } from 'react';
import { fetchWithAppCheck } from '../utils/generateAppCheckToken';
import { useUserStore } from '../stores/user/userStore';
import { getFCMToken } from '../utils/getFCMToken';
import { auth, messaging } from '../config/firebase.config';
import { onMessage } from 'firebase/messaging';

const useFCM = () => {
  const { setFcmToken, fcmToken, _hasHydrated, setHasHydrated, user } = useUserStore(
    (state) => state,
  );

  useEffect(() => {
    // ✅ Register service worker manually
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker
    //     .register('/firebase-messaging-sw.js')
    //     .then((registration) => {
    //       console.log('Service Worker registered with scope:', registration.scope);
    //     })
    //     .catch((err) => {
    //       console.error('Service Worker registration failed:', err);
    //     });
    // }
    async function fcmTokenUpdate() {
      // await getFCMToken(fcmToken, true);
      return setInterval(
        async () => {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
          }

          const currentToken = await getFCMToken(fcmToken, true);

          if (!currentToken || currentToken === '') throw Error('No token from fcm');

          if (currentToken && currentToken !== fcmToken) {
            if (user?.uid) {
              await fetchWithAppCheck(
                '/api/fcm/unsubscribe-fcm',
                (await auth.currentUser?.getIdToken()) ?? '',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    token: fcmToken,
                    topic: user?.uid,
                  }),
                  // headers: { 'Content-Type': 'application/json' },
                },
              );
            }

            setFcmToken(currentToken);

            if (user?.uid) {
              await fetchWithAppCheck(
                '/api/fcm/subscribe-fcm',
                (await auth.currentUser?.getIdToken()) ?? '',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    token: currentToken,
                    topic: user?.uid,
                  }),
                  // headers: { 'Content-Type': 'application/json' },
                },
              );
            }
          }
        },
        60 * 60 * 1000,
      );
    }
    // Check every hour

    let interval: NodeJS.Timeout;
    fcmTokenUpdate()
      .then((res) => {
        interval = res;
      })
      .catch((e) => {
        console.log('useFcm catch: ', e);
      });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return;
        }

        const token = await getFCMToken(fcmToken, true);
        if (!token || token === '') throw Error('No token from fcm');

        if (fcmToken !== token) {
          setFcmToken(token);

          if (user?.uid) {
            // Subscribe token to topic on the server
            await fetchWithAppCheck(
              '/api/fcm/subscribe-fcm',
              (await auth.currentUser?.getIdToken()) ?? '',
              {
                method: 'POST',
                body: JSON.stringify({ token, topic: user?.uid }),
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
          }
        }
      } catch (err) {
        console.error('Error setting up FCM:', err);
      }
    };

    setupFCM();
    const unSubscribeFcm = onMessage(messaging, async (message) => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && message.notification) {
        const { title, body, icon, image } = message.notification;
        new Notification(title ?? 'Notification!', { body: body, icon: icon ?? image });
      }
    });

    return () => {
      unSubscribeFcm();
    };
  }, [user?.uid, _hasHydrated]);
};

export default useFCM;
