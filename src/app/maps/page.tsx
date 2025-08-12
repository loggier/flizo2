
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
import { getDevices, getGeofences, getRoutes } from "@/services/flizo.service";
import type { Device, DeviceGroup, Geofence, Route } from "@/lib/types";
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
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  const [showLabels, setShowLabels] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<Set<number>>(new Set());
  const [visibleGeofenceIds, setVisibleGeofenceIds] = useState<Set<number>>(new Set());
  const [visibleRouteIds, setVisibleRouteIds] = useState<Set<number>>(new Set());


  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Load preferences from localStorage
    const savedMapType = localStorage.getItem("mapType") as MapType;
    if (savedMapType && ["OSM", "SATELLITE", "TRAFFIC"].includes(savedMapType)) {
      setMapType(savedMapType);
    }
    const savedShowLabels = localStorage.getItem("showLabels");
    if (savedShowLabels) {
      setShowLabels(JSON.parse(savedShowLabels));
    }
    const savedShowGeofences = localStorage.getItem("showGeofences");
    if (savedShowGeofences) {
      setShowGeofences(JSON.parse(savedShowGeofences));
    }
    const savedVisibleDeviceIds = localStorage.getItem('visibleDeviceIds');
    if (savedVisibleDeviceIds) {
        setVisibleDeviceIds(new Set(JSON.parse(savedVisibleDeviceIds)));
    }
     const savedVisibleGeofenceIds = localStorage.getItem('visibleGeofenceIds');
    if (savedVisibleGeofenceIds) {
      setVisibleGeofenceIds(new Set(JSON.parse(savedVisibleGeofenceIds)));
    }
    const savedVisibleRouteIds = localStorage.getItem('visibleRouteIds');
    if (savedVisibleRouteIds) {
      setVisibleRouteIds(new Set(JSON.parse(savedVisibleRouteIds)));
    }


    const clickedDeviceId = sessionStorage.getItem("selectedDeviceId");
    if (clickedDeviceId) {
        setSelectedDeviceId(parseInt(clickedDeviceId, 10));
        sessionStorage.removeItem("selectedDeviceId");
    }

    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const [fetchedGroups, fetchedGeofences, fetchedRoutes] = await Promise.all([
          getDevices(token),
          getGeofences(token),
          getRoutes(token)
        ]);

        setDeviceGroups(fetchedGroups);
        const flattenedDevices = fetchedGroups.flatMap(group => group.items);
        setAllDevices(flattenedDevices);
        setGeofences(fetchedGeofences);
        setRoutes(fetchedRoutes);


        if (isInitialLoad) {
            if (!savedVisibleDeviceIds) {
                setVisibleDeviceIds(new Set(flattenedDevices.map(d => d.id)));
            }
            if (!savedVisibleGeofenceIds) {
                setVisibleGeofenceIds(new Set(fetchedGeofences.map(g => g.id)));
            }
            if (!savedVisibleRouteIds) {
                setVisibleRouteIds(new Set(fetchedRoutes.map(r => r.id)));
            }
        }
        
        localStorage.setItem('devices', JSON.stringify(flattenedDevices));
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
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

    fetchData();
    const intervalId = setInterval(fetchData, 30000); 

    return () => clearInterval(intervalId);
  }, [router, isInitialLoad]);

  useEffect(() => {
    if (!map || isInitialLoad) return;
  
    const selectedDevice = allDevices.find(d => d.id === selectedDeviceId);
  
    if (selectedDevice && selectedDevice.lat && selectedDevice.lng) {
      map.panTo({ lat: selectedDevice.lat, lng: selectedDevice.lng });
      map.setZoom(18);
      map.panBy(0, 100);
    } else {
      const visibleDevices = allDevices.filter(d => visibleDeviceIds.has(d.id));
      if (visibleDevices.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        visibleDevices.forEach(device => {
          if (device.lat && device.lng) {
            bounds.extend({ lat: device.lat, lng: device.lng });
          }
        });
  
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      }
    }
  }, [map, allDevices, selectedDeviceId, visibleDeviceIds, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
        localStorage.setItem('visibleDeviceIds', JSON.stringify(Array.from(visibleDeviceIds)));
    }
  }, [visibleDeviceIds, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
        localStorage.setItem('visibleGeofenceIds', JSON.stringify(Array.from(visibleGeofenceIds)));
    }
  }, [visibleGeofenceIds, isInitialLoad]);

    useEffect(() => {
    if (!isInitialLoad) {
        localStorage.setItem('visibleRouteIds', JSON.stringify(Array.from(visibleRouteIds)));
    }
    }, [visibleRouteIds, isInitialLoad]);

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

  const toggleGeofenceVisibility = useCallback((geofenceIds: number | number[], visible: boolean) => {
    setVisibleGeofenceIds(prevVisibleIds => {
      const newVisibleIds = new Set(prevVisibleIds);
      const ids = Array.isArray(geofenceIds) ? geofenceIds : [geofenceIds];
      
      if (visible) {
        ids.forEach(id => newVisibleIds.add(id));
      } else {
        ids.forEach(id => newVisibleIds.delete(id));
      }
      
      return newVisibleIds;
    });
  }, []);

  const toggleRouteVisibility = useCallback((routeIds: number | number[], visible: boolean) => {
    setVisibleRouteIds(prevVisibleIds => {
        const newVisibleIds = new Set(prevVisibleIds);
        const ids = Array.isArray(routeIds) ? routeIds : [routeIds];
        
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
  
  const handleSelectGeofence = (geofence: Geofence) => {
    if (!map) return;
  
    const bounds = new google.maps.LatLngBounds();
  
    if (geofence.type === 'polygon' && geofence.coordinates) {
      try {
        const coords = JSON.parse(geofence.coordinates);
        coords.forEach((coord: { lat: number, lng: number }) => bounds.extend(coord));
      } catch (e) {
        console.error("Error parsing geofence coordinates:", e);
        return;
      }
    } else if (geofence.type === 'circle' && geofence.center && geofence.radius) {
      const circle = new google.maps.Circle({
        center: geofence.center,
        radius: geofence.radius,
      });
      bounds.union(circle.getBounds()!);
    }
  
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 50); // 50px padding
      setIsDeviceListOpen(false);
    }
  };

  const handleSelectRoute = (route: Route) => {
    if (!map || !route.coordinates || route.coordinates.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    route.coordinates.forEach(coord => bounds.extend(coord));

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 50); // 50px padding
      setIsDeviceListOpen(false);
    }
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

  const handleToggleGeofences = () => {
    setShowGeofences(prev => {
        const newState = !prev;
        localStorage.setItem("showGeofences", JSON.stringify(newState));
        return newState;
    });
  }

  const layerOptions: { id: MapType; label: string }[] = [
    { id: "OSM", label: t.bottomNav.map },
    { id: "SATELLITE", label: "Satélite" },
    { id: "TRAFFIC", label: "Tráfico" },
  ];

  const visibleDevices = allDevices.filter(device => visibleDeviceIds.has(device.id));
  const visibleGeofences = geofences.filter(g => visibleGeofenceIds.has(g.id));
  const visibleRoutes = routes.filter(r => visibleRouteIds.has(r.id));
  const selectedDevice = allDevices.find(d => d.id === selectedDeviceId) || null;

  return (
    <div className="relative h-full w-full">
      <MapComponent 
        mapType={mapType} 
        onMapLoad={setMap} 
        userPosition={userPosition} 
        heading={heading}
        devices={visibleDevices}
        geofences={showGeofences ? visibleGeofences : []}
        routes={visibleRoutes}
        showLabels={showLabels}
        onSelectDevice={handleSelectDevice}
        onDeselectDevice={handleDeselectDevice}
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
        onToggleGeofences={handleToggleGeofences}
        showGeofences={showGeofences}
      />
      <DeviceListSheet 
        isOpen={isDeviceListOpen} 
        onOpenChange={setIsDeviceListOpen}
        deviceGroups={deviceGroups}
        visibleDeviceIds={visibleDeviceIds}
        toggleDeviceVisibility={toggleDeviceVisibility}
        onSelectDevice={handleSelectDevice}
        geofences={geofences}
        visibleGeofenceIds={visibleGeofenceIds}
        toggleGeofenceVisibility={toggleGeofenceVisibility}
        onSelectGeofence={handleSelectGeofence}
        routes={routes}
        visibleRouteIds={visibleRouteIds}
        toggleRouteVisibility={toggleRouteVisibility}
        onSelectRoute={handleSelectRoute}
        isLoading={isLoading}
      />
       <VehicleDetailsSheet
        device={selectedDevice}
        onClose={handleDeselectDevice}
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
