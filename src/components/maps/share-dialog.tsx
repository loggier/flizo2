
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Device } from "@/lib/types";
import { createSharingLink } from "@/services/flizo.service";
import { useToast } from "@/hooks/use-toast";
import { DateTimePicker } from "../ui/datetime-picker";
import { Label } from "../ui/label";
import { format } from "date-fns";
import { LoaderIcon } from "../icons/loader-icon";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
}

export default function ShareDialog({
  isOpen,
  onOpenChange,
  device,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  
  const getDefaultExpiration = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 20);
    return date;
  };
  const [expirationDate, setExpirationDate] = useState<Date>(getDefaultExpiration());

  const handleShare = async () => {
    const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
    if (!token) {
        toast({ variant: 'destructive', title: 'Error de autenticación' });
        return;
    }

    setIsLoading(true);

    try {
        const formattedDate = format(expirationDate, "yyyy-MM-dd HH:mm");
        const result = await createSharingLink(token, device.id, formattedDate);
        const shareUrl = `${serverUrl}sharing/${result.hash}`;

        await navigator.share({
            title: `Compartir Ubicación de ${device.name}`,
            text: `Hola, te quiero compartir la ubicación del dispositivo ${device.name}`,
            url: shareUrl,
        });

        onOpenChange(false);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al compartir';
        toast({ variant: 'destructive', title: 'Error al compartir', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Compartir Ubicación de {device.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Selecciona la fecha y hora de expiración para el enlace que vas a compartir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
            <Label htmlFor="expiration-date">Válido hasta</Label>
            <DateTimePicker date={expirationDate} setDate={setExpirationDate} disabled={{ before: new Date() }} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleShare} disabled={isLoading}>
            {isLoading ? <LoaderIcon className="mr-2" /> : null}
            Generar y Compartir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
