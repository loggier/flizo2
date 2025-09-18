"use client";

import { useEffect, useState, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const sessionToken = sessionStorage.getItem("user_api_hash");
    const localToken = localStorage.getItem("user_api_hash");
    const isAuthenticated = !!sessionToken || !!localToken;
    const isAuthPage = pathname === '/';

    if (isAuthenticated && isAuthPage) {
      router.replace('/maps');
    } else if (!isAuthenticated && !isAuthPage) {
      router.replace('/');
    } else {
      setIsInitializing(false);
    }
  }, [pathname, router]);

  return { isInitializing };
};
