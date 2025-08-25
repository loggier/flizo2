
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, PushNotificationSchema, ActionPerformed, Token } from "@capacitor/push-notifications";
import { useToast } from "@/hooks/use-toast";
import { getFCMToken } from "@/lib/firebase";

const PushNotificationHandler = () => {
    const { toast } = useToast();

    useEffect(() => {
        const platform = Capacitor.getPlatform();

        if (platform === "web") {
            // Web-specific logic to get FCM token via Firebase SDK
            const initWebPush = async () => {
                try {
                    const fcmToken = await getFCMToken();
                    if (fcmToken) {
                        console.log("FCM Token:", fcmToken);
                        localStorage.setItem("fcm_token", fcmToken);
                    }
                } catch (error) {
                    console.error("FCM Token Error:", error);
                    toast({
                        variant: "destructive",
                        title: "Error de Notificaciones",
                        description: "No se pudo obtener el permiso para notificaciones web.",
                    });
                }
            };
            initWebPush();
        } else {
            // Native mobile logic (Android/iOS) via Capacitor
            const initMobilePush = async () => {
                try {
                    // Add all listeners
                    await PushNotifications.addListener('registration', (token: Token) => {
                        console.log('Push registration success, token: ', token.value);
                        localStorage.setItem("fcm_token", token.value);
                    });
    
                    await PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Error on registration: ', JSON.stringify(error));
                        toast({
                            variant: "destructive",
                            title: "Error de Registro de Push",
                            description: `No se pudo registrar para notificaciones: ${error.error || 'Error desconocido'}`,
                        });
                    });

                    await PushNotifications.addListener(
                        'pushNotificationReceived',
                        (notification: PushNotificationSchema) => {
                            console.log('Push notification received: ', notification);
                            if (notification.title && notification.body) {
                                toast({
                                    title: notification.title,
                                    description: notification.body,
                                });
                            }
                        },
                    );
            
                    await PushNotifications.addListener(
                        'pushNotificationActionPerformed',
                        (notification: ActionPerformed) => {
                            console.log('Push notification action performed', notification.actionId, notification.inputValue);
                        },
                    );

                    // Register the device with the push notification service
                    await PushNotifications.register();
                } catch (e) {
                    console.error("Error initializing mobile push", e);
                }
            }
            initMobilePush();
        }
    }, [toast]);

    return null;
};

export default PushNotificationHandler;
