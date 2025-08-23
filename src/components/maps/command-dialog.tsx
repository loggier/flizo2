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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Command } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
import { SendIcon } from "../icons/send-icon";

interface CommandDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  deviceName: string;
  onSendCommand: (command: Command) => void;
}

export default function CommandDialog({
  isOpen,
  onOpenChange,
  commands,
  deviceName,
  onSendCommand,
}: CommandDialogProps) {
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleCommandClick = (command: Command) => {
    setSelectedCommand(command);
    setIsConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    if (selectedCommand) {
      onSendCommand(selectedCommand);
    }
    setIsConfirmOpen(false);
    setSelectedCommand(null);
  };

  const handleCancelSend = () => {
    setIsConfirmOpen(false);
    setSelectedCommand(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Enviar Comando GPRS</SheetTitle>
            <SheetDescription>
              Selecciona un comando para enviar al dispositivo {deviceName}.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div className="space-y-2 pr-4">
              {commands.length > 0 ? (
                commands.map((command) => (
                  <div key={command.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleCommandClick(command)}
                    >
                      <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-md">
                              <SendIcon className="w-5 h-5"/>
                          </div>
                          <span className="font-semibold">{command.title}</span>
                      </div>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No hay comandos disponibles para este dispositivo.</p>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {selectedCommand && (
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Envío</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas enviar el comando{" "}
                <span className="font-bold">"{selectedCommand.title}"</span> al dispositivo{" "}
                <span className="font-bold">{deviceName}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelSend}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSend}>
                Enviar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}