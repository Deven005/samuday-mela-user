// app/lib/getAppData.ts
import { DocumentData } from "firebase-admin/firestore";
import { serverAuth, serverFirestore } from "../config/firebase.server.config";
import { cookies } from "next/headers";
import { MyNotification } from "../components/Notification/NotificationDropdown";

let cachedAppData: DocumentData | undefined, user: DocumentData | undefined; // ✅ Store cached data in a singleton variable

export async function getAppData() {
  if (!cachedAppData) {
    console.log("Fetching appData from Firestore...");
    cachedAppData = (await serverFirestore.doc("appData/general").get()).data(); // ✅ Cache the result
  }

  return cachedAppData; // ✅ Return cached data instead of refetching
}

export async function getUserData() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      user = undefined; // ✅ Reset user if no session exists
      return undefined;
    }
    const decodedToken = await serverAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    if (!user) {
      user = (
        await serverFirestore.doc(`Users/${decodedToken.uid}`).get()
      ).data();
    }
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
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
      .collection("notifications")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as MyNotification)
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}
