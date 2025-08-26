
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { LoaderIcon } from "@/components/icons/loader-icon";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("user_api_hash");
    const localToken = localStorage.getItem("user_api_hash");

    if (sessionToken || localToken) {
      router.replace("/maps");
    }
  }, [router]);

  // We can show a loading state while the check is happening,
  // but for a quick check, it might just flash briefly.
  // Returning the form directly is also fine.
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
