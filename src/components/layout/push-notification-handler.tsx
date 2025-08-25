
"use client";

import { useEffect, useRef } from "react";
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

        const registerAndSendToken = async () => {
            const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
            
            // Stop if user is not logged in or if we have already sent the token.
            if (!user_api_hash || tokenSent) {
                return;
            }

            // If we have an FCM token in storage, assume it's sent.
            const existingToken = localStorage.getItem("fcm_token");
            if (existingToken) {
                tokenSent = true;
                return;
            }

            try {
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
                
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'granted') {
                    await PushNotifications.register();
                }

            } catch (error) {
                console.error("Error during native push notification setup:", error);
            }
        };

        // Check periodically if user has logged in to send token.
        const intervalId = setInterval(registerAndSendToken, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return null; 
};

export default PushNotificationHandler;
