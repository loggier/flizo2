
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
              statusFilter === filter.value
                ? "font-bold shadow-lg"
                : "bg-primary/50 text-primary-foreground/80 hover:bg-primary/70",
              statusFilter === 'all' && filter.value === 'all' && 'bg-background text-primary',
              statusFilter === 'moving' && filter.value === 'moving' && 'bg-green-500 text-white hover:bg-green-600',
              statusFilter === 'stopped' && filter.value === 'stopped' && 'bg-yellow-500 text-black hover:bg-yellow-600',
              statusFilter === 'offline' && filter.value === 'offline' && 'bg-red-500 text-white hover:bg-red-600',
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </header>
  );
}
