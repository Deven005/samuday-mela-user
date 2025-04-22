// Import firebase-admin
import {
  ServiceAccount,
  initializeApp,
  cert,
  getApps,
} from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Set the config options
// Initialize the firebase admin app
const firebaseServerApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.PROJECT_ID,
          privateKey: (process.env.PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
          clientEmail: process.env.CLIENT_EMAIL,
        } as ServiceAccount),
        projectId: process.env.PROJECT_ID,
      });

const serverAppCheck = getAppCheck(firebaseServerApp);
const serverAuth = getAuth(firebaseServerApp);
const serverFirestore = getFirestore(firebaseServerApp);
const serverMessaging = getMessaging(firebaseServerApp);

export { serverAppCheck, serverAuth, serverFirestore, serverMessaging };
