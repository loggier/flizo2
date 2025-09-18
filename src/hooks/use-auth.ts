
"use client";

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuth = useCallback(() => {
    const sessionToken = sessionStorage.getItem("user_api_hash");
    const localToken = localStorage.getItem("user_api_hash");
    const hasAuth = !!sessionToken || !!localToken;
    setIsAuthenticated(hasAuth);

    const isAuthPage = pathname === '/';

    if (hasAuth && isAuthPage) {
      router.replace('/maps');
    } else if (!hasAuth && !isAuthPage) {
      router.replace('/');
    }
    
    // Give a small buffer for the initial render/redirect to settle
    setTimeout(() => setIsInitializing(false), 100);

  }, [pathname, router]);

  useEffect(() => {
    handleAuth();

    // Listen for storage changes to handle login/logout in other tabs
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('storage', handleAuth);
    };
  }, [handleAuth]);

  return { isInitializing, isAuthenticated };
};
