
"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token } from "@capacitor/push-notifications";
import { useToast } from "@/hooks/use-toast";
import { getFCMToken } from "@/lib/firebase";
import { sendFCMToken } from "@/services/flizo.service";

// Global flag to ensure token sending only happen once.
let tokenSent = false;

const PushNotificationHandler = () => {
    const { toast } = useToast();
    const isLoggedInRef = useRef(false);

    // Effect to handle the initial permission request. This should only run once.
    useEffect(() => {
        const requestPermission = async () => {
             // Only for native platforms
            if (Capacitor.getPlatform() === 'web') return;
            
            try {
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'prompt') {
                    // Request permission if it hasn't been asked before
                    await PushNotifications.requestPermissions();
                }
            } catch (error) {
                console.error("Error requesting push permissions", error);
            }
        };

        requestPermission();
    }, []);

    // Effect to get and send token when user logs in and if we don't have a token.
    useEffect(() => {
        const sendTokenAfterLogin = async () => {
            const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
            isLoggedInRef.current = !!user_api_hash;

            // Stop if user is not logged in or if we have already sent the token.
            if (!isLoggedInRef.current || tokenSent) {
                return;
            }

            const existingToken = localStorage.getItem("fcm_token");
            if (existingToken) {
                // If we have a token, assume it's sent and do nothing.
                tokenSent = true;
                return;
            }

            try {
                let fcmToken: string | null = null;
                const platform = Capacitor.getPlatform();

                if (platform !== 'web') {
                    // NATIVE PLATFORM LOGIC (Android/iOS)
                    await PushNotifications.removeAllListeners();

                    PushNotifications.addListener('registration', async (token: Token) => {
                        console.log('Native push registration success, token:', token.value);
                        fcmToken = token.value;
                        if (fcmToken && isLoggedInRef.current) {
                           try {
                             localStorage.setItem("fcm_token", fcmToken);
                             await sendFCMToken(user_api_hash!, fcmToken);
                             tokenSent = true; // Mark as sent
                             console.log('Native FCM Token sent successfully.');
                           } catch(e) {
                             console.error('Failed to send native FCM token', e);
                           }
                        }
                    });

                    PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Native push registration error:', error);
                    });
                    
                    // We only try to register if permissions are already granted.
                    const permStatus = await PushNotifications.checkPermissions();
                    if (permStatus.receive === 'granted') {
                        await PushNotifications.register();
                    }

                } else {
                    // WEB PLATFORM LOGIC
                    fcmToken = await getFCMToken();
                    if (fcmToken) {
                        localStorage.setItem("fcm_token", fcmToken);
                        if (isLoggedInRef.current) {
                           await sendFCMToken(user_api_hash!, fcmToken);
                           tokenSent = true;
                           console.log('Web FCM Token sent successfully.');
                        }
                    } else {
                       console.error("Failed to get web FCM Token. Permissions might be denied.");
                    }
                }
            } catch (error) {
                console.error("Error during push notification setup:", error);
            }
        };

        const intervalId = setInterval(sendTokenAfterLogin, 3000);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    return null; 
};

export default PushNotificationHandler;
