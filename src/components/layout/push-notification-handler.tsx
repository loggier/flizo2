
"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { useToast } from "@/hooks/use-toast";

// Global flag to ensure registration happens only once per app session.
let permissionRequested = false;

const PushNotificationHandler = () => {
    const { toast } = useToast();

    useEffect(() => {
        const requestPermission = async () => {
            if (permissionRequested || Capacitor.getPlatform() === 'web') {
                return;
            }
            permissionRequested = true;
            
            try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }
                
                if (permStatus.receive !== 'granted') {
                    toast({
                        variant: "destructive",
                        title: "Permiso denegado",
                        description: "No se concedió permiso, por lo que no podrá recibir notificaciones.",
                    });
                }
            } catch (e) {
                console.error("Error requesting push permission", e);
                 if (e instanceof Error) {
                    toast({
                        variant: "destructive",
                        title: "Error de Notificaciones",
                        description: `Error al solicitar permisos: ${e.message}`,
                    });
                }
            }
        };

        requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    return null;
};

export default PushNotificationHandler;
