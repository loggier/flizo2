
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
            const initMobilePush = async () => {
                try {
                    await PushNotifications.addListener('registration', (token: Token) => {
                        console.log('Push registration success, token: ', token.value);
                        localStorage.setItem("fcm_token", token.value);
                    });
    
                    await PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Error on registration: ', JSON.stringify(error));
                        toast({
                            variant: "destructive",
                            title: "Error de Registro de Push",
                            description: `No se pudo registrar para notificaciones: ${error.message || 'Error desconocido'}`,
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
                    
                    await PushNotifications.register();
                } catch (e) {
                    console.error("Error initializing mobile push", e);
                }
            }
            initMobilePush();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default PushNotificationHandler;
