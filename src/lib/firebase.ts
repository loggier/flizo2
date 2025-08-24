
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
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging || !("Notification" in window)) {
    console.log("Firebase Messaging is not supported in this browser.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY_HERE", // IMPORTANT: Replace with your VAPID key from Firebase console
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
        return null;
      }
    } catch (err) {
      console.error("An error occurred while retrieving token. ", err);
      return null;
    }
  } else {
    console.log("Unable to get permission to notify.");
    return null;
  }
};

export { app };
