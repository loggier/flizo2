
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token } from "@capacitor/push-notifications";
import { sendFCMToken } from "@/services/flizo.service";

// Global flag to ensure token sending only happen once per session.
let tokenSent = false;

const PushNotificationHandler = () => {
    
    // This effect handles the initial permission request for native platforms.
    useEffect(() => {
        // Only for native platforms
        if (Capacitor.getPlatform() === 'web') return;

        const requestPermission = async () => {
            try {
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'prompt') {
                    await PushNotifications.requestPermissions();
                }
            } catch (error) {
                console.error("Error requesting push permissions", error);
            }
        };

        requestPermission();
    }, []);

    // This effect handles obtaining and sending the token on NATIVE platforms.
    useEffect(() => {
        if (Capacitor.getPlatform() === 'web') return;

        const setupListeners = async () => {
            await PushNotifications.removeAllListeners();

            PushNotifications.addListener('registration', async (token: Token) => {
                console.log('Native push registration success, token:', token.value);
                if (token.value && !tokenSent) {
                   try {
                     const current_user_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
                     if (current_user_hash) {
                       await sendFCMToken(current_user_hash, token.value);
                       localStorage.setItem("fcm_token", token.value);
                       tokenSent = true;
                       console.log('Native FCM Token sent successfully.');
                     }
                   } catch(e) {
                     console.error('Failed to send native FCM token', e);
                   }
                }
            });

            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Native push registration error:', error);
            });
        };

        setupListeners();
        
        const tryToRegister = async () => {
            const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
            if (!user_api_hash || tokenSent) {
                return;
            }

            const existingToken = localStorage.getItem("fcm_token");
            if (existingToken) {
                tokenSent = true;
                return;
            }

            try {
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'granted') {
                    await PushNotifications.register();
                }
            } catch (error) {
                console.error("Error during native push notification registration:", error);
            }
        };

        // Check periodically if user has logged in to send token.
        const intervalId = setInterval(tryToRegister, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return null; 
};

export default PushNotificationHandler;
