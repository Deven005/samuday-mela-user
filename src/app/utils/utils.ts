// app/lib/getAppData.ts
import { DocumentData } from 'firebase-admin/firestore';
import { serverAuth, serverFirestore } from '../config/firebase.server.config';
import { cookies } from 'next/headers';
import { MyNotification } from '../components/Notification/NotificationDropdown';

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

export function formatLocalDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
