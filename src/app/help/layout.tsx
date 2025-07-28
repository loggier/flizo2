
import BottomNav from "@/components/layout/bottom-nav";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-primary-foreground text-center py-3 shadow-md">
        <h1 className="text-xl font-bold">SOPORTE</h1>
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
