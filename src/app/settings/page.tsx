
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { changePassword, getUserData, sendFCMToken } from "@/services/flizo.service";
import { Book, LogOut, RefreshCcw, Lock, Bell } from "lucide-react";
import Link from "next/link";
import { getFCMToken } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token } from "@capacitor/push-notifications";


export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [userEmail, setUserEmail] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [notificationStatus, setNotificationStatus] = useState("default");


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
    const privacyPolicyUrl = `${serverUrl}page/privacy_policy_new`;

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined' && "Notification" in window) {
            setNotificationStatus(Notification.permission);
        }
        const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
        if (token) {
            getUserData(token)
                .then(profile => {
                    if (profile?.email) {
                        setUserEmail(profile.email);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch user data", err);
                    handleLogout(); // Logout if token is invalid
                });
        } else {
            router.push('/');
        }
    }, [router]);

    const handleLogout = () => {
        const lng = localStorage.getItem('lng') || 'es';
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('lng', lng);
        router.push('/');
    };

    const handleResetApp = () => {
        window.location.reload();
    }

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "La nueva contraseña y la confirmación no coinciden.",
            });
            return;
        }

        const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
        if (!token) {
            handleLogout();
            return;
        }

        try {
            await changePassword(token, currentPassword, newPassword, confirmPassword);
            toast({
                title: "Éxito",
                description: "Contraseña cambiada correctamente. Se cerrará la sesión.",
            });
            setIsPasswordDialogOpen(false);
            setTimeout(handleLogout, 2000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
            toast({
                variant: "destructive",
                title: "Error al cambiar la contraseña",
                description: errorMessage,
            });
        }
    }

    const handleSubscribeToNotifications = async () => {
        setIsSubscribing(true);
        const user_api_hash = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");

        if (!user_api_hash) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para activar las notificaciones.' });
            setIsSubscribing(false);
            return;
        }

        try {
            // Logic for native platforms
            if (Capacitor.isNativePlatform()) {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    throw new Error('User denied permissions!');
                }

                await PushNotifications.register();
                
                PushNotifications.addListener('registration', async (token: Token) => {
                    await sendFCMToken(user_api_hash, token.value);
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Error on registration: ' + JSON.stringify(error));
                });
                
            } else {
            // Logic for web
                const permission = await Notification.requestPermission();
                setNotificationStatus(permission);

                if (permission === 'granted') {
                    const fcmToken = await getFCMToken();
                    if (fcmToken) {
                        await sendFCMToken(user_api_hash, fcmToken);
                        localStorage.setItem("fcm_token", fcmToken);
                        toast({ title: 'Suscripción exitosa', description: 'Ahora recibirás notificaciones.' });
                    } else {
                        throw new Error('No se pudo obtener el token FCM.');
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Permiso denegado', description: 'No se podrán recibir notificaciones si no concedes el permiso.' });
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
            toast({ variant: 'destructive', title: 'Error de suscripción', description: errorMessage });
        } finally {
            setIsSubscribing(false);
        }
    };


    if (!isClient) {
        return null;
    }

    const isWebPlatform = Capacitor.getPlatform() === 'web';


    return (
        <div className="p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">{userEmail || "Usuario"}</CardTitle>
                    <CardDescription className="text-center">
                        Usuario
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <AlertDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="secondary" className="flex-grow">
                                    <Lock className="mr-2" />
                                    Cambiar Contraseña
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Cambiar Contraseña</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Por favor, introduce tu contraseña actual y la nueva.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="current-password" >Actual</Label>
                                        <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="new-password">Nueva</Label>
                                        <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="confirm-password">Confirmar</Label>
                                        <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="col-span-3" />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleChangePassword}>Guardar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button onClick={handleLogout} className="flex-shrink">
                            <LogOut className="mr-2" />
                            Salir
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Notificaciones Push</CardTitle>
                    <CardDescription>
                        Administra el permiso para recibir notificaciones en este dispositivo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        className="w-full"
                        onClick={handleSubscribeToNotifications}
                        disabled={isSubscribing || notificationStatus === 'granted'}
                    >
                        <Bell className="mr-2"/>
                        {isSubscribing 
                            ? 'Procesando...' 
                            : notificationStatus === 'granted' 
                            ? 'Suscrito a Notificaciones'
                            : 'Activar Notificaciones'
                        }
                    </Button>
                    {notificationStatus === 'denied' && (
                        <p className="text-xs text-destructive mt-2 text-center">
                            Has bloqueado las notificaciones. Debes cambiar los permisos desde la configuración de tu navegador o de la app.
                        </p>
                    )}
                </CardContent>
            </Card>
            
            <Button asChild variant="outline" className="w-full justify-start bg-card">
                 <Link href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                    <Book className="mr-2"/> Política de Privacidad
                </Link>
            </Button>
            
            <Button variant="outline" className="w-full justify-start bg-card" onClick={handleResetApp}>
                <RefreshCcw className="mr-2"/> Reiniciar Aplicación
            </Button>
        </div>
    );
}

    