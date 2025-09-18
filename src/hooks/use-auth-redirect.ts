
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

async function isReady() {
  if (!Capacitor.isNativePlatform()) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    if (window.hasOwnProperty('Capacitor')) {
        resolve();
    } else {
        window.addEventListener('capacitorPlatformReady', () => resolve());
    }
  });
}

export function useAuthRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      await isReady();
      
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");

      if (token) {
        router.replace("/maps");
      } else {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  return { isChecking };
}
