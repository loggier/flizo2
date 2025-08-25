
"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from "@capacitor/push-notifications";
import { useToast } from "@/hooks/use-toast";
import { getFCMToken } from "@/lib/firebase";
import { sendFCMToken } from "@/services/flizo.service";

// Global flags to ensure initialization and token sending only happen once.
let registrationAttempted = false;
let tokenSent = false;

const PushNotificationHandler = () => {
    const { toast } = useToast();
    // Using useRef to track login status across renders without causing re-renders
    const isLoggedInRef = useRef(false);

    // Effect to handle initial permission request and token logic
    useEffect(() => {
        const initPush = async () => {
            if (registrationAttempted) return;
            registrationAttempted = true;

            const isNative = Capacitor.getPlatform() !== 'web';

            if (isNative) {
                const permStatus = await PushNotifications.checkPermissions();
                if (permStatus.receive === 'prompt') {
                    await PushNotifications.requestPermissions();
                }
            }
        };

        initPush();
    }, []);

    // Effect to send token when user logs in
    useEffect(() => {
        const sendTokenAfterLogin = async () => {
            const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
            
            // Update login status
            isLoggedInRef.current = !!user_api_hash;

            // Conditions to send token: must be logged in and token must not have been sent yet
            if (!isLoggedInRef.current || tokenSent) {
                return;
            }
            
            // Check if a token already exists to avoid re-fetching
            const existingToken = localStorage.getItem("fcm_token");
            if (existingToken) {
                try {
                    await sendFCMToken(user_api_hash!, existingToken);
                    tokenSent = true; // Mark as sent
                    console.log('Existing FCM Token sent successfully.');
                } catch (e) {
                    console.error('Error sending existing FCM token', e);
                }
                return; // Stop here if we have an existing token
            }

            // If no existing token, proceed with fetching a new one
            try {
                let fcmToken: string | null = null;
                if (Capacitor.getPlatform() !== 'web') {
                    // NATIVE PLATFORM LOGIC
                    await PushNotifications.removeAllListeners();

                    PushNotifications.addListener('registration', async (token: Token) => {
                        console.log('Native push registration success, token:', token.value);
                        localStorage.setItem("fcm_token", token.value);
                        if (isLoggedInRef.current) {
                           try {
                             await sendFCMToken(user_api_hash!, token.value);
                             tokenSent = true;
                             console.log('Native FCM Token sent successfully.');
                           } catch(e) {
                             console.error('Failed to send native FCM token', e);
                           }
                        }
                    });

                    PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Native push registration error:', error);
                        toast({
                            variant: "destructive",
                            title: "Error de Registro de Notificaciones",
                            description: `No se pudo obtener el token. ${JSON.stringify(error)}`,
                        });
                    });
                    
                    const permStatus = await PushNotifications.checkPermissions();
                    if (permStatus.receive === 'granted') {
                        await PushNotifications.register();
                    } else {
                        console.error("Permission not granted for push notifications.");
                    }

                } else {
                    // WEB PLATFORM LOGIC
                    fcmToken = await getFCMToken();
                    if (fcmToken) {
                        console.log('Web FCM Token obtained:', fcmToken);
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
                if (!isLoggedInRef.current) return; // Don't show toast if user is not logged in
                toast({
                    variant: "destructive",
                    title: "Permiso Requerido",
                    description: "No se pudo registrar el dispositivo. Por favor, habilite los permisos para recibir alertas.",
                });
            }
        };

        // We use an interval to periodically check for the login status without causing re-renders
        const intervalId = setInterval(sendTokenAfterLogin, 2000);

        return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

    return null; // This is a handler component, it doesn't render anything
};

export default PushNotificationHandler;
