
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, PushNotificationSchema, ActionPerformed } from "@capacitor/push-notifications";
import { useToast } from "@/hooks/use-toast";

const PushNotificationHandler = () => {
    const { toast } = useToast();

    useEffect(() => {
        if (Capacitor.getPlatform() !== "web") {
            // Register with Apple / Google to receive push notifications
            PushNotifications.register();

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration', (token) => {
                console.info('Registration token: ', token.value);
            });

            // Some issue with our setup and push will not work
            PushNotifications.addListener('registrationError', (error) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            });

            // Show an alert when a notification is received
            PushNotifications.addListener(
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

            // Method called when tapping on a notification
            PushNotifications.addListener(
                'pushNotificationActionPerformed',
                (notification: ActionPerformed) => {
                    console.log('Push notification action performed', notification.actionId, notification.inputValue);
                    // You can add navigation logic here based on the notification data
                },
            );
        }

        // Cleanup on component unmount
        return () => {
            if (Capacitor.getPlatform() !== 'web') {
                PushNotifications.removeAllListeners();
            }
        };

    }, [toast]);

    return null; // This component does not render anything
};

export default PushNotificationHandler;
