
"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoaderIcon } from '@/components/icons/loader-icon';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("user_api_hash");
    const localToken = localStorage.getItem("user_api_hash");
    const isAuthenticated = !!sessionToken || !!localToken;

    // If on the login page and already authenticated, redirect to maps
    if (pathname === '/' && isAuthenticated) {
      router.replace('/maps');
      // We don't stop initializing here, let it finish to show the maps page
      // setIsInitializing(false) will happen on the next render on the new page
    } 
    // If on any other page and not authenticated, redirect to login
    else if (pathname !== '/' && !isAuthenticated) {
      router.replace('/');
      // Same as above, let it finish on the new page
    }
    // Otherwise, we are on the correct page
    else {
      setIsInitializing(false);
    }
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
