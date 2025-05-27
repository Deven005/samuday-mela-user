// Import firebase-admin
import { ServiceAccount, initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { getStorage } from 'firebase-admin/storage';

// Set the config options
// Initialize the firebase admin app
const firebaseServerApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.PROJECT_ID,
          privateKey: (process.env.PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
          clientEmail: process.env.CLIENT_EMAIL,
        } as ServiceAccount),
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

const serverAppCheck = getAppCheck(firebaseServerApp);
const serverAuth = getAuth(firebaseServerApp);
const serverFirestore = getFirestore(firebaseServerApp);
const serverMessaging = getMessaging(firebaseServerApp);
const serverStorage = getStorage(firebaseServerApp);

export { serverAppCheck, serverAuth, serverFirestore, serverMessaging, serverStorage };
