
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PermissionState } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';
import { sendFCMToken } from '@/services/flizo.service';

const PushNotificationHandler = () => {
    const { toast } = useToast();
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [tokenSent, setTokenSent] = useState(false);

    const sendTokenToServer = useCallback(async (token: string) => {
        const userApiHash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
        if (!userApiHash) {
            console.log("User not logged in. Token will be sent after login.");
            return;
        }
        if (tokenSent) {
            console.log("Token already sent to server in this session.");
            return;
        }

        try {
            await sendFCMToken(userApiHash, token);
            setTokenSent(true); 
            console.log("FCM Token sent to server successfully.");
        } catch (error) {
            console.error("Failed to send FCM token to server", error);
            toast({
                variant: "destructive",
                title: "Error de Sincronización",
                description: "No se pudo registrar el dispositivo para notificaciones.",
            });
        }
    }, [toast, tokenSent]);


    useEffect(() => {
        const initPush = async () => {
            if (Capacitor.getPlatform() === 'web') return; // Native only

            // Clear old listeners to prevent duplicates
            await PushNotifications.removeAllListeners();

            PushNotifications.addListener('registration', (token: Token) => {
                console.log('Push registration success, token: ' + token.value);
                setFcmToken(token.value);
                sendTokenToServer(token.value);
            });

            PushNotifications.addListener('registrationError', (error: any) => {
                console.error('Error on registration: ' + JSON.stringify(error));
                toast({
                    variant: "destructive",
                    title: 'Error de Registro Push',
                    description: `No se pudo obtener el token de notificación. ${JSON.stringify(error)}`,
                });
            });

            let permStatus = await PushNotifications.checkPermissions();
            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                 toast({
                    variant: "destructive",
                    title: 'Permiso Denegado',
                    description: 'No se podrán recibir notificaciones si no concede el permiso.',
                });
                return;
            }
            
            await PushNotifications.register();
        };

        initPush();

        // Function to handle storage changes (login/logout)
        const handleStorageChange = () => {
            if (fcmToken && !tokenSent) {
                sendTokenToServer(fcmToken);
            }
        };
        
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, [sendTokenToServer, toast, fcmToken, tokenSent]);

    return null;
};

export default PushNotificationHandler;
