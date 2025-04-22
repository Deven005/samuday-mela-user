"use client";
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase.config";
import { fetchWithAppCheck } from "../utils/generateAppCheckToken";
import { useUserStore } from "../stores/user/userStore";
import { useShallow } from "zustand/shallow";
import { getFCMToken } from "../utils/getFCMToken";

const useFCM = (userId: string) => {
  const { setFcmToken, fcmToken, _hasHydrated, setHasHydrated } = useUserStore(
    (state) => state
  );

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }

    const setupFCM = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Notification permission not granted");
          return;
        }

        const token = await getFCMToken(setHasHydrated);
        if (!token || token === "") throw Error("No token from fcm");

        if (
          (token && fcmToken !== token) ||
          !fcmToken ||
          fcmToken === undefined
        ) {
          setFcmToken(token);

          // Subscribe token to topic on the server
          await fetchWithAppCheck("/api/fcm/subscribe-fcm", {
            method: "POST",
            body: JSON.stringify({ token, topic: userId }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      } catch (err) {
        console.error("Error setting up FCM:", err);
      }
    };

    setupFCM();

    return () => {};
  }, [userId, _hasHydrated]);

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }
    // ✅ Register service worker manually
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
    const interval = setInterval(async () => {
      const currentToken = await getFCMToken(setHasHydrated);

      if (!currentToken || currentToken === "")
        throw Error("No token from fcm");

      if (currentToken && currentToken !== fcmToken) {
        await fetchWithAppCheck("/api/fcm/unsubscribe-fcm", {
          method: "POST",
          body: JSON.stringify({
            token: fcmToken,
            topic: userId,
          }),
          headers: { "Content-Type": "application/json" },
        });
        setFcmToken(currentToken);
        await fetchWithAppCheck("/api/fcm/subscribe-fcm", {
          method: "POST",
          body: JSON.stringify({
            token: currentToken,
            topic: userId,
          }),
          headers: { "Content-Type": "application/json" },
        });
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);
};

export default useFCM;
