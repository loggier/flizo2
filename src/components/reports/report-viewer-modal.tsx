
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import Link from "next/link";

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportUrl: string | null;
  downloadUrl: string | null;
}

export default function ReportViewerModal({
  isOpen,
  onClose,
  reportUrl,
  downloadUrl,
}: ReportViewerModalProps) {
  if (!isOpen || !reportUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-none w-[95vw] h-[85vh] flex flex-col p-2 sm:p-4">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2 border-b">
          <DialogTitle>Visor de Reporte</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={reportUrl}
            title="Reporte"
            className="w-full h-full border-0"
          />
        </div>
        <DialogFooter className="pt-2 border-t">
          {downloadUrl && (
            <Button asChild>
                <Link href={downloadUrl} target="_blank" download>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                </Link>
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
