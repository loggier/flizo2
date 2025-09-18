
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';

async function isReady() {
  if (!Capacitor.isNativePlatform()) {
    return Promise.resolve();
  }
  // On native, we need to wait for the platform to be ready.
  return new Promise<void>((resolve) => {
    if (window.hasOwnProperty('Capacitor')) {
        resolve();
    } else {
        window.addEventListener('capacitorPlatformReady', () => resolve());
    }
  });
}

export const useAuthRedirect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await isReady();
      
      const sessionToken = sessionStorage.getItem("user_api_hash");
      const localToken = localStorage.getItem("user_api_hash");
      const token = sessionToken || localToken;
      
      if (token && pathname === '/') {
        router.replace('/maps');
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  return { isChecking };
};
