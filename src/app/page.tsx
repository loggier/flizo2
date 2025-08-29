
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("user_api_hash");
    const localToken = localStorage.getItem("user_api_hash");

    if (sessionToken || localToken) {
      router.replace("/maps");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-gray-100">
      <LoginForm />
    </main>
  );
}
