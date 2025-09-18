
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { storage } from "@/lib/storage";

const SESSION_KEY = "user_api_hash";
const PUBLIC_PATHS = ["/"];

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const token = await storage.get(SESSION_KEY);
      if (!mounted) return;

      const isPublicPath = PUBLIC_PATHS.includes(pathname);

      if (token && isPublicPath) {
        router.replace("/maps");
      } else if (!token && !isPublicPath) {
        router.replace("/");
      } else {
        setIsChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  return { isChecking };
}
