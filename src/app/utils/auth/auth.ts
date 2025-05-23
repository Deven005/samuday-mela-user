// lib/session.ts
import { serverAuth, serverFirestore, serverMessaging } from '@/app/config/firebase.server.config';
import { createHash } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import {
  clearUserData,
  formatLocalDate,
  getDistanceFromLatLonInKm,
  getUserData,
  removeUndefinedDeep,
} from '../utils';
import { subscribeToFcmTopicServerSide } from '../fcm/fcm-server';
import { CreateRequest, UserProvider, UserRecord } from 'firebase-admin/auth';

interface SessionType {
  origin: string;
  idToken: string;
  headers: Headers;
  fcmTokens?: string[];
}

interface DeleteSessionType {
  idToken: string;
  fcmTokens?: string[];
}

export async function createSession({ origin, idToken, headers, fcmTokens }: SessionType) {
  try {
    await clearUserData();

    const ip = origin.includes('localhost')
      ? // ? '152.59.23.76'
        '192.168.100.100'
      : headers.get('x-forwarded-for')?.toString().split(',')[0] || null;

    // Validate ID token
    const verifiedUser = await serverAuth.verifyIdToken(idToken, true);

    // Only process if the user just signed in in the last 5 minutes.
    if (new Date().getTime() / 1000 - verifiedUser.auth_time >= 5 * 60)
      throw Error('Recent sign in required!');

    // Check for custom header from Flutter
    const client = headers.get('X-Client-Source');
    // Or fallback to checking User-Agent (not always reliable)
    const userAgent = headers.get('user-agent') || '';

    // Detect Flutter
    const isFlutter =
      client === 'flutter-user-app' ||
      userAgent.includes('Dart') ||
      userAgent.includes('(dart:io)');

    if (!isFlutter) {
      // Create a session cookie (valid for 7 days)
      const expiresIn = 1000 * 60 * 60 * 24 * 7; // 7 days
      const sessionCookie = await serverAuth.createSessionCookie(idToken, {
        expiresIn,
      });

      (await cookies()).set('session', sessionCookie, {
        httpOnly: true,
        secure: true,
        maxAge: expiresIn,
        sameSite: 'strict',
      });
    }

    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();
    console.log('geo: ', geo);

    if (geo.error != true) {
      const loginRef = serverFirestore.collection(`userLogins`);
      const loginUserRef = loginRef.where('uid', '==', verifiedUser.uid);

      // 1. Device fingerprint
      const deviceHash = createHash('sha256').update(`${geo.ip}-${userAgent}`).digest('hex');

      const snapshot = await loginUserRef
        .where('deviceHash', '==', deviceHash)
        // .where('ip', '==', geo.ip)
        .where('country_name', '==', geo.country_name)
        .where('region', '==', geo.region)
        .where('postal', '==', geo.postal)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      const isNewLocation = snapshot.empty;

      // 3. Check distance from last login (optional)
      const previousSnapshot = await loginUserRef.orderBy('timestamp', 'desc').limit(1).get();
      const previousData = previousSnapshot.docs[0]?.data();
      let distanceKm = 0;

      if (previousData?.latitude && previousData?.longitude) {
        distanceKm = getDistanceFromLatLonInKm(
          previousData.latitude,
          previousData.longitude,
          geo.latitude,
          geo.longitude,
        );
      }

      // 4. If login is suspicious
      const isSuspicious = isNewLocation || distanceKm > 100;

      if (isSuspicious) {
        const now = Timestamp.now();
        // Store new login location
        await loginRef.add({
          ...geo,
          uid: verifiedUser.uid,
          userAgent: userAgent,
          timestamp: now,
        });

        // Optionally send a notification if it's not the first ever login
        const totalLogins = await loginUserRef.get();
        const isFirstLogin = totalLogins.size === 1;

        if (!isFirstLogin) {
          const notificationRes = await fetch(`${origin}/api/notification`, {
            method: 'POST',
            // headers: {
            //   'Content-Type': 'application/json',
            //   Authorization: req.headers.get('Authorization')?.replace('Bearer ', '') ?? '',
            //   session: sessionCookie,
            // },
            body: JSON.stringify({
              topic: verifiedUser.uid,
              title: '⚠️🔐 New Login Detected!',
              body: `Your account was accessed from ${geo.city}, ${geo.region}, ${geo.country_name} at ${formatLocalDate(
                now.toDate(),
                geo.timezone || 'UTC',
              )}.`,
            }),
          });
          console.log('notificationRes: ', notificationRes);
          console.log('notificationRes: ', notificationRes.ok);
          console.log('notificationRes: ', await notificationRes.json());
        }
      }
    }

    if (fcmTokens && fcmTokens.length > 0) {
      await subscribeToFcmTopicServerSide({ tokens: fcmTokens, topic: verifiedUser.uid });
      await subscribeToFcmTopicServerSide({ tokens: fcmTokens, topic: 'global' });
    }
    await getUserData();
  } catch (error) {
    throw error;
  }
}

export async function deleteSession({ idToken, fcmTokens }: DeleteSessionType) {
  try {
    // Validate ID token
    const verifiedUser = await serverAuth.verifyIdToken(idToken, true);

    if (fcmTokens) {
      // if (fcmTopics && fcmTopics.length > 0) {
      //   for (const topic of fcmTopics) {
      //     try {
      //       var res = await serverMessaging.unsubscribeFromTopic(fcmTokens, topic);
      //       console.log(`Unsubscribed from ${topic}:`, res.successCount);
      //     } catch (err) {
      //       console.error(`Error unsubscribing from ${topic}:`, err);
      //     }
      //   }
      // }

      await serverMessaging.unsubscribeFromTopic(fcmTokens, verifiedUser.uid);
      await serverMessaging.unsubscribeFromTopic(fcmTokens, 'global');
    }
    // await serverAuth.revokeRefreshTokens(verifiedUser.sub);
    (await cookies()).delete('session');
    await clearUserData();
  } catch (error) {
    console.error('Session deletion error:', error);
    throw error;
  }
}

export function generateStrongPassword(length = 16): string {
  if (length < 8) throw new Error('Password length must be at least 8 characters.');

  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  const all = upper + lower + digits + specials;

  // Ensure at least one character from each category
  const getRandom = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const basePassword = [getRandom(upper), getRandom(lower), getRandom(digits), getRandom(specials)];

  // Fill the rest with random characters from all categories
  for (let i = basePassword.length; i < length; i++) {
    basePassword.push(getRandom(all));
  }

  // Shuffle the characters for unpredictability
  const shuffled = basePassword
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .join('');

  return shuffled;
}

export async function getOrCreateUser({
  origin,
  properties,
  headers,
  userProvider,
  userProviderData,
}: CreateUserType) {
  try {
    // 🔍 Try to get existing Firebase user by email
    let user: UserRecord;
    if (properties.email) {
      user = await serverAuth.getUserByEmail(properties.email!);
    } else {
      user = await serverAuth.getUser(properties.uid!);
    }
    if (userProvider && !user.providerData.some((p) => p.providerId === userProvider.providerId)) {
      await serverAuth.updateUser(user.uid, { providerToLink: userProvider });
      await serverFirestore
        .doc(`Users/${user.uid}`)
        .update(removeUndefinedDeep({ ...user, ...userProviderData }), { exists: true });
    }
    return { user };
  } catch (error: any) {
    // Type-safe inspection
    if (typeof error === 'object' && error !== null) {
      const firebaseError = JSON.parse(JSON.stringify(error));

      if (firebaseError.code === 'auth/user-not-found') {
        const user = await serverAuth.createUser(properties);

        if (userProvider) {
          await serverAuth.updateUser(user.uid, { providerToLink: userProvider });
        }
        const userData = {
          ...removeUndefinedDeep((await serverAuth.getUser(user.uid)).toJSON()),
          story: 'Share a bit about yourself, your passions, and what drives you! 💬✨',
          address: 'Update your address!',
          interests: [] as string[],
          vibe: 'What’s your vibe today? Spill the tea! ☕️🔥',
          currentOccupation: '',
          preferredLanguage: 'hi',
          signUpFromIpAddress: origin.includes('localhost')
            ? // ? '152.59.23.76'
              '192.168.100.100'
            : headers.get('x-forwarded-for')?.toString().split(',')[0] || null,
        };
        await serverAuth.setCustomUserClaims(user.uid, { user: true });

        await serverFirestore
          .doc(`Users/${user.uid}`)
          .create(removeUndefinedDeep({ ...userData, ...userProviderData }));
        return { user, userData };
      }
    } else {
      throw { error };
    }
  }
}

export async function logoutUser({ idToken, fcmTokens }: LogOutUserTye) {
  await deleteSession({ idToken, fcmTokens: fcmTokens });
}

interface LogOutUserTye {
  idToken: string;
  fcmTokens?: string[];
}

interface CreateUserType {
  origin: string;
  properties: CreateRequest;
  headers: Headers;
  userProvider?: UserProvider;
  userProviderData?: UserProviderType;
}

interface UserProviderType {
  gender: string | null | undefined;
  link: string | null | undefined;
  locale: string | null | undefined;
  family_name: string | null | undefined;
  given_name: string | null | undefined;
  hd: string | null | undefined;
}
