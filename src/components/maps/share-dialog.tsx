
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import type { Device } from "@/lib/types";
import { createSharingLink } from "@/services/flizo.service";
import { useToast } from "@/hooks/use-toast";
import { DateTimePicker } from "../ui/datetime-picker";
import { Label } from "../ui/label";
import { format } from "date-fns";
import { LoaderIcon } from "../icons/loader-icon";
import { Input } from "../ui/input";
import { Copy, Share2 } from "lucide-react";

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
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleGenerateLink = async () => {
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
        setGeneratedUrl(shareUrl);
        onOpenChange(false); // Close the first dialog
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al compartir';
        toast({ variant: 'destructive', title: 'Error al generar enlace', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!generatedUrl) return;

    try {
      if (!navigator.share) {
        throw new Error("La API para compartir no está disponible en este navegador.");
      }
      await navigator.share({
        title: `Compartir Ubicación de ${device.name}`,
        text: `Hola, te quiero compartir la ubicación del dispositivo ${device.name}`,
        url: generatedUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled the share operation, do nothing.
      } else {
        const errorMessage = error instanceof Error ? error.message : 'No se pudo compartir el enlace.';
        toast({ variant: "destructive", title: "Error al compartir", description: errorMessage });
      }
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    toast({ title: "Copiado", description: "Enlace copiado al portapapeles." });
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setExpirationDate(getDefaultExpiration());
  }

  const closeShareUrlDialog = () => {
    setGeneratedUrl(null);
  }

  return (
    <>
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
            <AlertDialogCancel onClick={resetAndClose}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateLink} disabled={isLoading}>
              {isLoading ? <LoaderIcon className="mr-2" /> : null}
              Generar Enlace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!generatedUrl} onOpenChange={(open) => !open && closeShareUrlDialog()}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Enlace Generado</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">El enlace se ha generado correctamente. Puedes compartirlo o copiarlo.</p>
              <div className="relative">
                <Input value={generatedUrl ?? ''} readOnly />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline">Cerrar</Button>
              </DialogClose>
              <Button onClick={handleShare}>
                <Share2 className="mr-2" />
                Compartir
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
