// app/utils/getFCMToken.ts
import { getToken } from "firebase/messaging";
import { messaging } from "../config/firebase.config";
import { fetchWithAppCheck } from "./generateAppCheckToken";

interface SendNotificationType {
  topic: string;
  title?: string | undefined;
  body?: string | undefined;
}

export async function getFCMToken(setHasHydrated: (hydrated: boolean) => void) {
  try {
    setHasHydrated(true);
    return await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_VAPID_KEY, // ✅ Stored securely in .env
    });
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export const sendNotification = async ({
  topic,
  title,
  body,
}: SendNotificationType) => {
  const res = await fetchWithAppCheck("/api/notification", {
    method: "POST",
    body: JSON.stringify({
      topic,
      title,
      body,
    }),
    headers: { "Content-Type": "application/json" },
  });

  console.log("sendNotification res: ", res);
};
