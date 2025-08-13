
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlertsSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background text-foreground shadow-sm p-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Configuración de Alertas</h1>
        </div>
      </header>
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}
