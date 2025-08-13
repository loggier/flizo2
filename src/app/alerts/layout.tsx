
import BottomNav from "@/components/layout/bottom-nav";
import { AlertsHeader } from "@/components/alerts/header";

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AlertsHeader />
      <main className="flex-1 overflow-y-auto pt-24 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
