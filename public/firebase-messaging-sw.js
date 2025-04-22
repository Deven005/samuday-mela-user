importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD_3R-lrT-_Z9V7B4Xo3hEpPXJZ3lh1fUQ",
  authDomain: "samudaymela.firebaseapp.com",
  projectId: "samudaymela",
  messagingSenderId: "333211413775",
  appId: "1:333211413775:web:444d0d9f5805454e04627a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const { title, body, image, icon } = payload.data;

  const notificationOptions = {
    body,
    icon:
      icon ??
      "https://firebasestorage.googleapis.com/v0/b/samudaymela.appspot.com/o/public%2FAppLogo.png?alt=media&token=c2d303b5-c27f-4bde-a8c4-5bb434c30237",
    image,
    data: {
      url:
        payload.fcmOptions?.link || "https://samuday-mela-user.firebaseapp.com",
    },
  };

  // Optional: Style urgent notifications differently
  if (data.urgent === "true" || data.priority === "high") {
    notificationOptions.requireInteraction = true;
    notificationOptions.tag = "urgent";
  }

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const link = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(link));
});
