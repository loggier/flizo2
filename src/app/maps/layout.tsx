
"use client";

import BottomNav from "@/components/layout/bottom-nav";

export default function MapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
