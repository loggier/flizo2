
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderIcon } from '@/components/icons/loader-icon';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    function checkAuth() {
      if (!active) return;
      
      const sessionToken = sessionStorage.getItem("user_api_hash");
      const localToken = localStorage.getItem("user_api_hash");
      const isAuthenticated = !!sessionToken || !!localToken;

      if (pathname === '/' && isAuthenticated) {
        router.replace('/maps');
        // Let initialization finish on the new page
      } else if (pathname !== '/' && !isAuthenticated) {
        router.replace('/');
        // Let initialization finish on the new page
      } else {
        setIsInitializing(false);
      }
    }

    checkAuth();
    
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderIcon className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
