
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

const firebaseConfig = {
    projectId: "flizo-copilot-login",
    appId: "1:347619621827:web:1260a21bf44fddb90a9b76",
    storageBucket: "flizo-copilot-login.firebasestorage.app",
    apiKey: "AIzaSyAcJKiiBrLi1beUV5akPtCooxGIdyxcW14",
    authDomain: "flizo-copilot-login.firebaseapp.com",
    measurementId: "",
    messagingSenderId: "347619621827"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
