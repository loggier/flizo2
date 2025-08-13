
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
      <main className="flex-1 flex flex-col pt-24 pb-16 h-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
