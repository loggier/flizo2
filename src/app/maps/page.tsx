
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapComponent from "@/components/maps/map-placeholder";
import { Button } from "@/components/ui/button";
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
            <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enableBackground="new 0 0 64 64" xmlSpace="preserve" fill="currentColor" className="h-6 w-6">
              <g>
                <path d="M58.982,32.088C58.985,32.057,59,32.031,59,32c0-2.866-0.589-28-21-28H26C12.654,4,5,14.206,5,32 c0,0.031,0.015,0.057,0.018,0.088C2.176,32.559,0,35.027,0,38v10c0,3.309,2.691,6,6,6v5c0,0.553,0.447,1,1,1h8c0.553,0,1-0.447,1-1 v-5h32v5c0,0.553,0.447,1,1,1h8c0.553,0,1-0.447,1-1v-5c3.309,0,6-2.691,6-6V38C64,35.027,61.824,32.559,58.982,32.088z M26,6h12 c18.467,0,19,23.339,19,26h-2c0-2.456-0.505-24-18-24H27C15.393,8,9,16.523,9,32H7C7,9.378,18.904,6,26,6z M24,24 c-4.418,0-8,3.582-8,8h-5c0-18.184,8.701-22,16-22h10c6.34,0,10.909,3.16,13.581,9.394C52.825,24.632,53,30.367,53,32H32 C32,27.582,28.418,24,24,24z M30,32H18c0-3.313,2.687-6,6-6S30,28.687,30,32z M14,58H8v-4h6V58z M56,58h-6v-4h6V58z M62,48 c0,2.206-1.794,4-4,4H6c-2.206,0-4-1.794-4-4V38c0-2.206,1.794-4,4-4h52c2.206,0,4,1.794,4,4V48z"></path>
                <path d="M11,39c-2.206,0-4,1.794-4,4s1.794,4,4,4s4-1.794,4-4S13.206,39,11,39z M11,45c-1.103,0-2-0.897-2-2 s0.897-2,2-2s2,0.897,2,2S12.103,45,11,45z"></path>
                <path d="M53,39c-2.206,0-4,1.794-4,4s1.794,4,4,4s4-1.794,4-4S55.206,39,53,39z M53,45c-1.103,0-2-0.897-2-2 s0.897-2,2-2s2,0.897,2,2S54.103,45,53,45z"></path>
                <path d="M43,40H21c-0.553,0-1,0.447-1,1s0.447,1,1,1h22c0.553,0,1-0.447,1-1S43.553,40,43,40z"></path>
                <path d="M43,44H21c-0.553,0-1,0.447-1,1s0.447,1,1,1h22c0.553,0,1-0.447,1-1S43.553,44,43,44z"></path>
                <path d="M42.707,15.294c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l2,2 c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414L42.707,15.294z"></path>
                <path d="M37.707,15.293c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l7,7C43.488,23.902,43.744,24,44,24 s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414L37.707,15.293z"></path>
              </g>
            </svg>
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
