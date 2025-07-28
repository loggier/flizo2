
"use client";

import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVehicleFilter } from "@/hooks/use-vehicle-filter";
import { cn } from "@/lib/utils";
import { VehicleStatus } from "@/app/vehicles/page";

export function VehicleHeader() {
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useVehicleFilter();

  const filters: { label: string; value: VehicleStatus }[] = [
    { label: "Todos", value: "all" },
    { label: "Movimiento", value: "moving" },
    { label: "Detenido", value: "stopped" },
    { label: "Offline", value: "offline" },
  ];

  const getButtonClass = (value: VehicleStatus) => {
    const isActive = statusFilter === value;

    if (isActive) {
      return "bg-background text-primary font-bold shadow-lg";
    }

    switch (value) {
      case "all":
        return "bg-primary/80 text-primary-foreground/90 hover:bg-primary";
      case "moving":
        return "bg-green-500/80 text-white/90 hover:bg-green-500";
      case "stopped":
        return "bg-yellow-500/80 text-black/90 hover:bg-yellow-500";
      case "offline":
        return "bg-red-500/80 text-white/90 hover:bg-red-500";
      default:
        return "bg-primary/80 text-primary-foreground/90 hover:bg-primary";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground shadow-md p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar Vehículos..."
            className="w-full rounded-full bg-background text-foreground pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center justify-around gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-full text-sm h-8 flex-1 transition-all duration-300",
              getButtonClass(filter.value)
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </header>
  );
}
