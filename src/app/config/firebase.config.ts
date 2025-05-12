import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';
import { FirebasePerformance, getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// if (!getApps().length) {
//   initializeApp(firebaseConfig);
// }
// const app = initializeApp(firebaseConfig);
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Initialize Firebase auth
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

let appCheck: AppCheck,
  performance: FirebasePerformance,
  messaging: Messaging,
  analytics: Analytics;

if (typeof window !== 'undefined') {
  // Initialize App Check with ReCaptcha v3 provider
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string),
    isTokenAutoRefreshEnabled: true, // Automatically refresh App Check tokens
  });

  // Initialize Performance Monitoring
  performance = getPerformance(app);
  isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null));

  try {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        messaging = getMessaging(app);
      }
    });
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
}

export { appCheck, auth, firestore, storage, analytics, messaging, performance };
