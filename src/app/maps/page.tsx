
"use client";

import { useState, useEffect } from "react";
import MapComponent from "@/components/maps/map-placeholder";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import MapControls from "@/components/maps/map-controls";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLanguage } from "@/hooks/use-language";

export type MapType = "OSM" | "SATELLITE" | "TRAFFIC";

export default function MapsPage() {
  const [mapType, setMapType] = useState<MapType>("OSM");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const savedMapType = localStorage.getItem("mapType") as MapType;
    if (savedMapType && ["OSM", "SATELLITE", "TRAFFIC"].includes(savedMapType)) {
      setMapType(savedMapType);
    }
  }, []);

  const handleLocateUser = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.panTo({ lat: latitude, lng: longitude });
          map.setZoom(15);
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Could not get your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleLayerChange = () => {
    setIsSheetOpen(true);
  };
  
  const handleSelectLayer = (type: MapType) => {
    setMapType(type);
    localStorage.setItem("mapType", type);
    setIsSheetOpen(false);
  };

  const layerOptions: { id: MapType; label: string }[] = [
    { id: "OSM", label: t.bottomNav.map }, // Assuming 'Map' means 'Normal' or 'Street'
    { id: "SATELLITE", label: "Satélite" },
    { id: "TRAFFIC", label: "Tráfico" },
  ];

  return (
    <div className="relative h-full w-full">
      <MapComponent mapType={mapType} onMapLoad={setMap} />
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="icon" className="bg-background rounded-full shadow-md hover:bg-primary hover:text-primary-foreground">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      <MapControls 
        onLayerChange={handleLayerChange}
        onLocateUser={handleLocateUser}
      />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Mapas</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            {layerOptions.map((option) => (
              <Button
                key={option.id}
                variant={mapType === option.id ? "default" : "outline"}
                size="lg"
                onClick={() => handleSelectLayer(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
