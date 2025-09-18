"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/bottom-nav";
import { Capacitor } from "@capacitor/core";
import { LoaderIcon } from "@/components/icons/loader-icon";

async function isReady() {
  if (!Capacitor.isNativePlatform()) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    if (window.hasOwnProperty("Capacitor")) {
      resolve();
    } else {
      window.addEventListener("capacitorPlatformReady", () => resolve());
    }
  });
}

function MapsLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await isReady();
      const token =
        localStorage.getItem("user_api_hash") ||
        sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.replace("/");
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoaderIcon className="h-12 w-12 text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground">
          Inicializando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function MapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MapsLayoutContent>{children}</MapsLayoutContent>;
}
