
"use client";

import BottomNav from "@/components/layout/bottom-nav";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-background">
       <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold mx-auto">Ajustes</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
