
"use client";

import { useState } from "react";
import MapComponent from "@/components/maps/map-placeholder";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import MapControls from "@/components/maps/map-controls";

export type MapType = "OSM" | "SATELLITE" | "TRAFFIC";

export default function MapsPage() {
  const [mapType, setMapType] = useState<MapType>("OSM");
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleLayerChange = () => {
    const types: MapType[] = ["OSM", "SATELLITE", "TRAFFIC"];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

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
    </div>
  );
}
