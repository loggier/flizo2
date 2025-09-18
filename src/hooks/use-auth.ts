
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleAuth = () => {
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
    };
    
    handleAuth();

    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('storage', handleAuth);
    }
    
  }, [pathname, router]);

  return { isInitializing };
};
