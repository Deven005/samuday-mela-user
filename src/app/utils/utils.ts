// app/lib/getAppData.ts
import { DocumentData } from 'firebase-admin/firestore';
import { serverAuth, serverFirestore } from '../config/firebase.server.config';
import { cookies } from 'next/headers';
import { MyNotification } from '../components/Notification/NotificationDropdown';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AppFeature {
  title: string;
  description: string;
}

export interface AppSocialLinks {
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface AppData {
  appName: string;
  tagline: string;
  description: string;
  description_hide: string;
  bannerUrl: string;
  iconUrl: string;
  logoUrl: string;
  themeColor: string;
  supportEmail: string;
  socialLinks: AppSocialLinks;
  features: AppFeature[];
}

let cachedAppData: AppData | undefined, user: DocumentData | undefined; // ✅ Store cached data in a singleton variable
const cache: Record<string, { data: any; timestamp: number }> = {},
  userByIdCache: Record<string, { data: any; timestamp: number }> = {};

export async function getAppData() {
  if (!cachedAppData) {
    console.log('Fetching appData from Firestore...');
    cachedAppData = (await serverFirestore.doc('appData/general').get()).data() as AppData; // ✅ Cache the result
  }

  return cachedAppData; // ✅ Return cached data instead of refetching
}

export async function getUserData() {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;

    if (!sessionCookie) {
      user = undefined; // ✅ Reset user if no session exists
      return undefined;
    }
    const decodedToken = await serverAuth.verifySessionCookie(sessionCookie, true);

    if (!user) {
      user = (await serverFirestore.doc(`Users/${decodedToken.uid}`).get()).data();
    }
    return user?.uid === decodedToken.uid ? user : undefined;
  } catch (error) {
    console.error('Error fetching user data:', error);
    user = undefined;
    return undefined;
  }
}

export async function getUserDataByUid(uid: string) {
  try {
    const now = Date.now();
    const userByIdCached = userByIdCache[uid];

    if (userByIdCached && now - userByIdCached.timestamp < 60 * 60 * 1000)
      return userByIdCached.data;

    const user = (await serverFirestore.doc(`Users/${uid}`).get()).data();
    if (user?.empty) throw new Error('No user found');

    // ✅ 3. Only keep public-safe fields
    const publicData = {
      displayName: user!.displayName,
      photoURL: user!.photoURL,
      vibe: user!.vibe,
      story: user!.story,
      slug: user!.slug,
    };
    userByIdCache[uid] = { data: publicData, timestamp: now };
    return publicData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    user = undefined;
    return undefined;
  }
}

export async function getUserDataSlug(slug: string) {
  try {
    const now = Date.now();
    const cached = cache[slug];

    if (cached && now - cached.timestamp < 60 * 60 * 1000) return cached.data;

    console.log('fetching user slug');
    var userDocs = await serverFirestore
      .collection(`Users`)
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (userDocs.empty) throw new Error('No user found');
    const user = userDocs.docs[0].data();
    // ✅ 3. Only keep public-safe fields
    const publicData = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      vibe: user.vibe,
      story: user.story,
      slug: user.slug,
      uid: user.uid,
      // hobbies: user.privacy?.hobbies ? user.hobbies : undefined,
      // currentOccupation: user.privacy?.occupation ? user.currentOccupation : undefined,
      // website: user.website,
      // joinedAt: user.joinedAt,
      // location: user.location,
    };
    cache[slug] = { data: publicData, timestamp: now };
    return publicData;
  } catch (error) {
    console.error('Error fetching user by slug!');
    throw error;
  }
}

export async function clearUserData() {
  user = undefined;
}

export async function getNotifications() {
  try {
    const uid = (await getUserData())?.uid;

    if (!uid) {
      return [];
    }

    // ✅ Fetch notifications from Firestore
    const snapshot = await serverFirestore
      .collection('notifications')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MyNotification);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function formatLocalDate(date: Date, timeZone: string = 'UTC') {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function rsaDecrypt(base64Data: string): string {
  const privateKeyPath = path.resolve('keys/private.pem');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  const passphrase = process.env.RSA_PRIVATE_KEY_PASSPHRASE;
  if (!passphrase) throw new Error('RSA passphrase not set in environment');

  const buffer = Buffer.from(base64Data, 'base64');
  // openssl rsa -in private.pem -passin pass:publicPass -outform PEM -pubout -out public.pem
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      passphrase,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );

  return decrypted.toString('utf-8');
}

/**
 * Encrypts a JS object using RSA (OAEP + SHA256)
 * @param data Object to encrypt (e.g., { email, password })
 * @returns base64-encoded encrypted string
 */
export function encryptJsonPayload(data: Record<string, any>): string {
  const publicKeyPath = path.resolve('keys/public.pem'); // Ensure public.pem exists
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

  const json = JSON.stringify(data);
  const buffer = Buffer.from(json, 'utf-8');

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    buffer,
  );

  return encrypted.toString('base64');
}

export function removeUndefinedDeep(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedDeep);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefinedDeep(v)]),
    );
  }
  return obj;
}

export interface StandardizedError {
  message: string;
  code?: string | number;
  status?: number;
}

export function parseError(error: unknown): StandardizedError {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>;

    return {
      message: typeof err.message === 'string' ? err.message : 'An unknown error occurred',
      code:
        typeof err.code === 'string' || typeof err.code === 'number'
          ? err.code
          : 'Error with unknown code!',
      status: typeof err.status === 'number' ? err.status : 400,
    };
  }

  // If error is just a string
  if (typeof error === 'string') {
    return { message: error };
  }

  return { message: 'An unknown error occurred' };
}
