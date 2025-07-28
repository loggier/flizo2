
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapComponent from "@/components/maps/map-placeholder";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import MapControls from "@/components/maps/map-controls";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useLanguage } from "@/hooks/use-language";
import { getDevices } from "@/services/flizo.service";
import type { Device } from "@/lib/types";
import DeviceStatusSummary from "@/components/maps/device-status-summary";


export type MapType = "OSM" | "SATELLITE" | "TRAFFIC";

export default function MapsPage() {
  const router = useRouter();
  const [mapType, setMapType] = useState<MapType>("OSM");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [heading, setHeading] = useState(0);
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const savedMapType = localStorage.getItem("mapType") as MapType;
    if (savedMapType && ["OSM", "SATELLITE", "TRAFFIC"].includes(savedMapType)) {
      setMapType(savedMapType);
    }
    const savedShowLabels = localStorage.getItem("showLabels");
    if (savedShowLabels) {
      setShowLabels(JSON.parse(savedShowLabels));
    }


    const fetchDevices = async () => {
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const fetchedDevices = await getDevices(token);
        setDevices(fetchedDevices);
        localStorage.setItem('devices', JSON.stringify(fetchedDevices));
        
        if (fetchedDevices.length > 0 && map) {
            const bounds = new google.maps.LatLngBounds();
            fetchedDevices.forEach(device => {
                if (device.lat && device.lng) {
                    bounds.extend({ lat: device.lat, lng: device.lng });
                }
            });
            map.fitBounds(bounds);
        }

      } catch (error) {
        console.error("Failed to fetch devices:", error);
        if ((error as Error).message === 'Unauthorized') {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/");
        }
      }
    };

    fetchDevices();
    const intervalId = setInterval(fetchDevices, 30000); 

    return () => clearInterval(intervalId);
  }, [router, map]);

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    }
    
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
        }
    };
  }, []);

  const handleLocateUser = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = { lat: latitude, lng: longitude };
          setUserPosition(userCoords);
          map.panTo(userCoords);
          map.setZoom(18);
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

  const handleToggleLabels = () => {
    setShowLabels(prev => {
        const newState = !prev;
        localStorage.setItem("showLabels", JSON.stringify(newState));
        return newState;
    });
  }

  const layerOptions: { id: MapType; label: string }[] = [
    { id: "OSM", label: t.bottomNav.map },
    { id: "SATELLITE", label: "Satélite" },
    { id: "TRAFFIC", label: "Tráfico" },
  ];

  return (
    <div className="relative h-full w-full">
      <MapComponent 
        mapType={mapType} 
        onMapLoad={setMap} 
        userPosition={userPosition} 
        heading={heading}
        devices={devices}
        showLabels={showLabels}
      />
      <div className="absolute top-4 left-4">
        <Button variant="default" size="icon" className="bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90">
          <Car className="h-6 w-6" />
        </Button>
      </div>
      <DeviceStatusSummary devices={devices} />
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
