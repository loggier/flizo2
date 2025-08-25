
import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  projectId: "flizo-copilot-login",
  appId: "1:347619621827:web:1260a21bf44fddb90a9b76",
  storageBucket: "flizo-copilot-login.firebasestorage.app",
  apiKey: "AIzaSyAcJKiiBrLi1beUV5akPtCooxGIdyxcW14",
  authDomain: "flizo-copilot-login.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "347619621827"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const messaging = () => {
    if (typeof window !== 'undefined' && "serviceWorker" in navigator) {
        return getMessaging(app);
    }
    return null;
}

export const getFCMToken = async (): Promise<string | null> => {
  const msg = messaging();
  if (!msg || !("Notification" in window) || Notification.permission !== 'granted') {
    console.log("Firebase Messaging not supported or permission not granted.");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) {
    console.error("VAPID key is not configured in .env.local");
    return null;
  }

  try {
    const currentToken = await getToken(msg, {
        vapidKey: vapidKey,
    });
    if (currentToken) {
        return currentToken;
    } else {
        console.log("No registration token available.");
        return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export { app };
