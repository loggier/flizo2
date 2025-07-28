
"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Device, DeviceGroup } from "@/lib/types";
import DeviceStatusSummary from "@/components/maps/device-status-summary";
import DeviceListSheet from "@/components/maps/device-list-sheet";
import { LoaderIcon } from "@/components/icons/loader-icon";
import VehicleDetailsSheet from "@/components/maps/vehicle-details-sheet";


export type MapType = "OSM" | "SATELLITE" | "TRAFFIC";

export default function MapsPage() {
  const router = useRouter();
  const [mapType, setMapType] = useState<MapType>("OSM");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLayerSheetOpen, setIsLayerSheetOpen] = useState(false);
  const [isDeviceListOpen, setIsDeviceListOpen] = useState(false);
  const [userPosition, setUserPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [heading, setHeading] = useState(0);
  const { t } = useLanguage();
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<Set<number>>(new Set());
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedMapType = localStorage.getItem("mapType") as MapType;
    if (savedMapType && ["OSM", "SATELLITE", "TRAFFIC"].includes(savedMapType)) {
      setMapType(savedMapType);
    }
    const savedShowLabels = localStorage.getItem("showLabels");
    if (savedShowLabels) {
      setShowLabels(JSON.parse(savedShowLabels));
    }

    const clickedDeviceId = sessionStorage.getItem("selectedDeviceId");
    if (clickedDeviceId) {
        setSelectedDeviceId(parseInt(clickedDeviceId, 10));
        sessionStorage.removeItem("selectedDeviceId");
    }

    const fetchDevices = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const fetchedGroups = await getDevices(token);
        setDeviceGroups(fetchedGroups);
        const flattenedDevices = fetchedGroups.flatMap(group => group.items);
        setAllDevices(flattenedDevices);

        if (isInitialLoad) {
            if (localStorage.getItem('visibleDeviceIds')) {
                const savedVisibleDeviceIds = JSON.parse(localStorage.getItem('visibleDeviceIds')!);
                setVisibleDeviceIds(new Set(savedVisibleDeviceIds));
            } else {
                setVisibleDeviceIds(new Set(flattenedDevices.map(d => d.id)));
            }
        }
        
        localStorage.setItem('devices', JSON.stringify(flattenedDevices));
        
      } catch (error) {
        console.error("Failed to fetch devices:", error);
        if ((error as Error).message === 'Unauthorized') {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/");
        }
      } finally {
        setIsLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    fetchDevices();
    const intervalId = setInterval(fetchDevices, 30000); 

    return () => clearInterval(intervalId);
  }, [router, isInitialLoad]);

  useEffect(() => {
    if (!map) return;

    // Zoom to selected device if one is chosen
    if (selectedDeviceId) {
      const selectedDevice = allDevices.find(d => d.id === selectedDeviceId);
      if (selectedDevice && selectedDevice.lat && selectedDevice.lng) {
        map.panTo({ lat: selectedDevice.lat, lng: selectedDevice.lng });
        map.setZoom(18);
      }
    // On initial load, if no device is selected, fit all visible devices on map
    } else if (isInitialLoad && allDevices.length > 0 && visibleDeviceIds.size > 0) {
      const bounds = new google.maps.LatLngBounds();
      allDevices.forEach(device => {
        if (device.lat && device.lng && visibleDeviceIds.has(device.id)) {
          bounds.extend({ lat: device.lat, lng: device.lng });
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  }, [map, allDevices, selectedDeviceId, visibleDeviceIds, isInitialLoad]);

  useEffect(() => {
    if (allDevices.length > 0) { // Ensure we don't save an empty set on initial load
        localStorage.setItem('visibleDeviceIds', JSON.stringify(Array.from(visibleDeviceIds)));
    }
  }, [visibleDeviceIds, allDevices]);

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
  
  const toggleDeviceVisibility = useCallback((deviceIds: number | number[], visible: boolean) => {
    setVisibleDeviceIds(prevVisibleIds => {
      const newVisibleIds = new Set(prevVisibleIds);
      const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
      
      if (visible) {
        ids.forEach(id => newVisibleIds.add(id));
      } else {
        ids.forEach(id => newVisibleIds.delete(id));
      }
      
      return newVisibleIds;
    });
  }, []);

  const handleSelectDevice = (device: Device) => {
    if (device.lat && device.lng) {
      setSelectedDeviceId(device.id);
      setIsDeviceListOpen(false); // Close list if open
    }
  };

  const handleDeselectDevice = () => {
    setSelectedDeviceId(null);
  };

  const handleLocateUser = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = { lat: latitude, lng: longitude };
          setUserPosition(userCoords);
          setSelectedDeviceId(null); // Deselect device when locating user
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
    setIsLayerSheetOpen(true);
  };
  
  const handleSelectLayer = (type: MapType) => {
    setMapType(type);
    localStorage.setItem("mapType", type);
    setIsLayerSheetOpen(false);
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

  const visibleDevices = allDevices.filter(device => visibleDeviceIds.has(device.id));
  const selectedDevice = allDevices.find(d => d.id === selectedDeviceId) || null;

  return (
    <div className="relative h-full w-full">
      <MapComponent 
        mapType={mapType} 
        onMapLoad={setMap} 
        userPosition={userPosition} 
        heading={heading}
        devices={visibleDevices}
        showLabels={showLabels}
        onSelectDevice={handleSelectDevice}
      />
      {isLoading && isInitialLoad && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <LoaderIcon className="h-10 w-10 text-primary" />
          <p className="mt-4 text-lg font-semibold text-primary-foreground">Cargando vehículos...</p>
        </div>
      )}
      <div className="absolute top-4 left-4">
        <Button 
            variant="default" 
            size="icon" 
            className="bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90"
            onClick={() => setIsDeviceListOpen(true)}
        >
             <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fillRule="evenodd" clipRule="evenodd" d="M2 14.803v6.447c0 .414.336.75.75.75h1.614a.75.75 0 0 0 .74-.627L5.5 19h13l.395 2.373a.75.75 0 0 0 .74.627h1.615a.75.75 0 0 0 .75-.75v-6.447a5.954 5.954 0 0 0-1-3.303l-.78-1.17a1.994 1.994 0 0 1-.178-.33h.994a.75.75 0 0 0 .671-.415l.25-.5A.75.75 0 0 0 21.287 8H19.6l-.31-1.546a2.5 2.5 0 0 0-1.885-1.944C15.943 4.17 14.141 4 12 4c-2.142 0-3.943.17-5.405.51a2.5 2.5 0 0 0-1.886 1.944L4.399 8H2.714a.75.75 0 0 0-.67 1.085l.25.5a.75.75 0 0 0 .67.415h.995a1.999 1.999 0 0 1-.178.33L3 11.5c-.652.978-1 2.127-1 3.303zm15.961-4.799a4 4 0 0 0 .34.997H5.699c.157-.315.271-.65.34-.997l.632-3.157a.5.5 0 0 1 .377-.39C8.346 6.157 10 6 12 6c2 0 3.654.156 4.952.458a.5.5 0 0 1 .378.389l.631 3.157zM5.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM20 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="currentColor"></path></g></svg>
        </Button>
      </div>
      <DeviceStatusSummary devices={allDevices} />
      <MapControls 
        onLayerChange={handleLayerChange}
        onLocateUser={handleLocateUser}
      />
      <DeviceListSheet 
        isOpen={isDeviceListOpen} 
        onOpenChange={setIsDeviceListOpen}
        deviceGroups={deviceGroups}
        visibleDeviceIds={visibleDeviceIds}
        toggleDeviceVisibility={toggleDeviceVisibility}
        onSelectDevice={handleSelectDevice}
        isLoading={isLoading && isInitialLoad}
      />
       <VehicleDetailsSheet
        device={selectedDevice}
        isOpen={!!selectedDevice}
        onOpenChange={(open) => {
          if (!open) {
            handleDeselectDevice();
          }
        }}
      />
      <Sheet open={isLayerSheetOpen} onOpenChange={setIsLayerSheetOpen}>
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
