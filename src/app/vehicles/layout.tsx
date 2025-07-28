
import BottomNav from "@/components/layout/bottom-nav";
import { VehicleHeader } from "@/components/vehicles/header";
import { VehicleFilterProvider } from "@/hooks/use-vehicle-filter";

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VehicleFilterProvider>
      <div className="flex flex-col h-screen bg-background">
        <VehicleHeader />
        <main className="flex-1 overflow-y-auto pt-36">{children}</main>
        <BottomNav />
      </div>
    </VehicleFilterProvider>
  );
}
