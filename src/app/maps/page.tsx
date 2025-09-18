
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
import { getDevices, getGeofences, getRoutes, getPOIs } from "@/services/flizo.service";
import type { Device, DeviceGroup, Geofence, Route, POI } from "@/lib/types";
import DeviceStatusSummary from "@/components/maps/device-status-summary";
import DeviceListSheet from "@/components/maps/device-list-sheet";
import { LoaderIcon } from "@/components/icons/loader-icon";
import VehicleDetailsSheet from "@/components/maps/vehicle-details-sheet";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { useToast } from "@/hooks/use-toast";
import { Car, Pin, PinOff } from "lucide-react";
import { storage } from "@/lib/storage";


export type MapType = "OSM" | "SATELLITE" | "TRAFFIC";

export default function MapsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
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
  const [pois, setPois] = useState<POI[]>([]);

  const [showLabels, setShowLabels] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showPOIs, setShowPOIs] = useState(true);
  const [autoCenter, setAutoCenter] = useState(true);
  const [showCluster, setShowCluster] = useState(true);
  
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<Set<number>>(new Set());
  const [visibleGeofenceIds, setVisibleGeofenceIds] = useState<Set<number>>(new Set());
  const [visibleRouteIds, setVisibleRouteIds] = useState<Set<number>>(new Set());
  const [visiblePoiIds, setVisiblePoiIds] = useState<Set<number>>(new Set());


  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [followedDeviceId, setFollowedDeviceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      const [
        savedMapType,
        savedShowLabels,
        savedShowGeofences,
        savedShowRoutes,
        savedShowPOIs,
        savedAutoCenter,
        savedShowCluster,
        savedVisibleDeviceIds,
        savedVisibleGeofenceIds,
        savedVisibleRouteIds,
        savedVisiblePoiIds,
        clickedDeviceId
      ] = await Promise.all([
        storage.get("mapType"),
        storage.get("showLabels"),
        storage.get("showGeofences"),
        storage.get("showRoutes"),
        storage.get("showPOIs"),
        storage.get("autoCenter"),
        storage.get("showCluster"),
        storage.get('visibleDeviceIds'),
        storage.get('visibleGeofenceIds'),
        storage.get('visibleRouteIds'),
        storage.get('visiblePoiIds'),
        storage.get("selectedDeviceId")
      ]);

      if (savedMapType && ["OSM", "SATELLITE", "TRAFFIC"].includes(savedMapType)) {
        setMapType(savedMapType as MapType);
      }
      if (savedShowLabels) setShowLabels(JSON.parse(savedShowLabels));
      if (savedShowGeofences !== null) setShowGeofences(JSON.parse(savedShowGeofences));
      if (savedShowRoutes !== null) setShowRoutes(JSON.parse(savedShowRoutes));
      if (savedShowPOIs !== null) setShowPOIs(JSON.parse(savedShowPOIs));
      if (savedAutoCenter !== null) setAutoCenter(JSON.parse(savedAutoCenter));
      if (savedShowCluster !== null) setShowCluster(JSON.parse(savedShowCluster));
      if (savedVisibleDeviceIds) setVisibleDeviceIds(new Set(JSON.parse(savedVisibleDeviceIds)));
      if (savedVisibleGeofenceIds) setVisibleGeofenceIds(new Set(JSON.parse(savedVisibleGeofenceIds)));
      if (savedVisibleRouteIds) setVisibleRouteIds(new Set(JSON.parse(savedVisibleRouteIds)));
      if (savedVisiblePoiIds) setVisiblePoiIds(new Set(JSON.parse(savedVisiblePoiIds)));

      if (clickedDeviceId) {
        setSelectedDeviceId(parseInt(clickedDeviceId, 10));
        await storage.remove("selectedDeviceId");
      }
    };
    
    loadPreferences();

    const fetchData = async () => {
      setIsLoading(true);
      const token = await storage.get("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const [fetchedGroups, fetchedGeofences, fetchedRoutes, fetchedPois] = await Promise.all([
          getDevices(token),
          getGeofences(token),
          getRoutes(token),
          getPOIs(token)
        ]);

        setDeviceGroups(fetchedGroups);
        const flattenedDevices = fetchedGroups.flatMap(group => group.items);
        setAllDevices(flattenedDevices);
        setGeofences(fetchedGeofences);
        setRoutes(fetchedRoutes);
        setPois(fetchedPois);

        if (isInitialLoad) {
            const visibleDeviceIdsStr = await storage.get('visibleDeviceIds');
            if (!visibleDeviceIdsStr) setVisibleDeviceIds(new Set(flattenedDevices.map(d => d.id)));

            const visibleGeofenceIdsStr = await storage.get('visibleGeofenceIds');
            if (!visibleGeofenceIdsStr) setVisibleGeofenceIds(new Set(fetchedGeofences.map(g => g.id)));

            const visibleRouteIdsStr = await storage.get('visibleRouteIds');
            if (!visibleRouteIdsStr) setVisibleRouteIds(new Set(fetchedRoutes.map(r => r.id)));
            
            const visiblePoiIdsStr = await storage.get('visiblePoiIds');
            if (!visiblePoiIdsStr) setVisiblePoiIds(new Set(fetchedPois.map(p => p.id)));
        }
        
        await storage.set('devices', JSON.stringify(flattenedDevices));
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if ((error as Error).message === 'Unauthorized') {
          await storage.remove("user_api_hash");
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
  
    const followedDevice = allDevices.find(d => d.id === followedDeviceId);
    const selectedDevice = allDevices.find(d => d.id === selectedDeviceId);
  
    if (followedDevice && followedDevice.lat && followedDevice.lng) {
        map.panTo({ lat: followedDevice.lat, lng: followedDevice.lng });
        if (map.getZoom()! < 16) map.setZoom(16);
    } else if (selectedDevice && selectedDevice.lat && selectedDevice.lng) {
      map.panTo({ lat: selectedDevice.lat, lng: selectedDevice.lng });
      if (map.getZoom()! < 18) {
        map.setZoom(18);
      }
      map.panBy(0, 150);
    } else if (autoCenter) {
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
  }, [map, allDevices, selectedDeviceId, followedDeviceId, visibleDeviceIds, isInitialLoad, autoCenter]);

  useEffect(() => {
    if (!isInitialLoad) {
        storage.set('visibleDeviceIds', JSON.stringify(Array.from(visibleDeviceIds)));
    }
  }, [visibleDeviceIds, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
        storage.set('visibleGeofenceIds', JSON.stringify(Array.from(visibleGeofenceIds)));
    }
  }, [visibleGeofenceIds, isInitialLoad]);

    useEffect(() => {
    if (!isInitialLoad) {
        storage.set('visibleRouteIds', JSON.stringify(Array.from(visibleRouteIds)));
    }
    }, [visibleRouteIds, isInitialLoad]);
    
    useEffect(() => {
    if (!isInitialLoad) {
        storage.set('visiblePoiIds', JSON.stringify(Array.from(visiblePoiIds)));
    }
    }, [visiblePoiIds, isInitialLoad]);

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
  
  const togglePoiVisibility = useCallback((poiIds: number | number[], visible: boolean) => {
    setVisiblePoiIds(prevVisibleIds => {
        const newVisibleIds = new Set(prevVisibleIds);
        const ids = Array.isArray(poiIds) ? poiIds : [poiIds];
        
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
      setFollowedDeviceId(null); // Unfollow when selecting a new device
      setIsDeviceListOpen(false); // Close list if open
    }
  };

  const handleDeselectDevice = () => {
    setSelectedDeviceId(null);
  };
  
  const handleFollowDevice = (device: Device) => {
    setFollowedDeviceId(device.id);
    setSelectedDeviceId(null); // Close details sheet
  };

  const handleStopFollowing = () => {
    setFollowedDeviceId(null);
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
      map.fitBounds(bounds, 50);
      setIsDeviceListOpen(false);
    }
  };

  const handleSelectPOI = (poi: POI) => {
    if (!map || !poi.parsedCoordinates) return;
    map.panTo(poi.parsedCoordinates);
    map.setZoom(17);
    setIsDeviceListOpen(false);
  };

  const handleLocateUser = async () => {
    if (!map) return;
  
    if (Capacitor.isNativePlatform()) {
      try {
        let permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
          permissions = await Geolocation.requestPermissions();
        }
  
        if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
          toast({
            variant: "destructive",
            title: "Permiso de ubicación denegado",
            description: "Por favor, habilita los permisos de ubicación para usar esta función.",
          });
          return;
        }
  
        const position = await Geolocation.getCurrentPosition();
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserPosition(userCoords);
        setSelectedDeviceId(null); // Deselect device when locating user
        setFollowedDeviceId(null);
        map.panTo(userCoords);
        map.setZoom(18);
      } catch (error) {
        console.error("Error getting user location with Capacitor:", error);
        toast({
            variant: "destructive",
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación.",
        });
      }
    } else {
      // Fallback for web
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = { lat: latitude, lng: longitude };
            setUserPosition(userCoords);
            setSelectedDeviceId(null);
            setFollowedDeviceId(null);
            map.panTo(userCoords);
            map.setZoom(18);
          },
          (error) => {
            console.error("Error getting user location with browser API:", error);
            toast({
                variant: "destructive",
                title: "Error de ubicación",
                description: "No se pudo obtener tu ubicación.",
            });
          }
        );
      } else {
        toast({
            variant: "destructive",
            title: "Función no soportada",
            description: "La geolocalización no está soportada en este navegador.",
        });
      }
    }
  };

  const handleLayerChange = () => {
    setIsLayerSheetOpen(true);
  };
  
  const handleSelectLayer = (type: MapType) => {
    setMapType(type);
    storage.set("mapType", type);
    setIsLayerSheetOpen(false);
  };

  const handleToggleLabels = () => {
    setShowLabels(prev => {
        const newState = !prev;
        storage.set("showLabels", JSON.stringify(newState));
        return newState;
    });
  }

  const handleToggleGeofences = () => {
    setShowGeofences(prev => {
        const newState = !prev;
        storage.set("showGeofences", JSON.stringify(newState));
        return newState;
    });
  }

  const handleToggleRoutes = () => {
    setShowRoutes(prev => {
        const newState = !prev;
        storage.set("showRoutes", JSON.stringify(newState));
        return newState;
    });
  }

   const handleTogglePOIs = () => {
    setShowPOIs(prev => {
        const newState = !prev;
        storage.set("showPOIs", JSON.stringify(newState));
        return newState;
    });
  }

  const handleToggleAutoCenter = () => {
    setAutoCenter(prev => {
        const newState = !prev;
        storage.set("autoCenter", JSON.stringify(newState));
        return newState;
    });
  }

  const handleToggleCluster = () => {
    setShowCluster(prev => {
      const newState = !prev;
      storage.set("showCluster", JSON.stringify(newState));
      return newState;
    });
  };

  const layerOptions: { id: MapType; label: string }[] = [
    { id: "OSM", label: t.bottomNav.map },
    { id: "SATELLITE", label: "Satélite" },
    { id: "TRAFFIC", label: "Tráfico" },
  ];

  const geofencesToRender = showGeofences ? geofences.filter(g => visibleGeofenceIds.has(g.id)) : [];
  const routesToRender = showRoutes ? routes.filter(r => visibleRouteIds.has(r.id)) : [];
  const poisToRender = showPOIs ? pois.filter(p => visiblePoiIds.has(p.id)) : [];

  const selectedDevice = allDevices.find(d => d.id === selectedDeviceId) || null;
  const followedDevice = allDevices.find(d => d.id === followedDeviceId) || null;

  if (isLoading && isInitialLoad) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <LoaderIcon className="h-12 w-12 text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground">
          Inicializando...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapComponent 
        mapType={mapType} 
        onMapLoad={setMap} 
        userPosition={userPosition} 
        heading={heading}
        devices={allDevices}
        visibleDeviceIds={visibleDeviceIds}
        geofences={geofencesToRender}
        routes={routesToRender}
        pois={poisToRender}
        showLabels={showLabels}
        onSelectDevice={handleSelectDevice}
        onDeselectDevice={handleDeselectDevice}
        followedDevice={followedDevice}
        showCluster={showCluster}
      />
      <div className="absolute top-4 left-4">
        <Button 
            variant="default" 
            size="icon" 
            className="bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90"
            onClick={followedDeviceId ? handleStopFollowing : () => setIsDeviceListOpen(true)}
        >
            {followedDeviceId ? <PinOff className="h-6 w-6" /> : <Car className="h-6 w-6" />}
        </Button>
      </div>
      <DeviceStatusSummary devices={allDevices} />
      <MapControls 
        isFollowing={!!followedDeviceId}
        onLayerChange={handleLayerChange}
        onLocateUser={handleLocateUser}
        onToggleGeofences={handleToggleGeofences}
        showGeofences={showGeofences}
        onToggleRoutes={handleToggleRoutes}
        showRoutes={showRoutes}
        onToggleAutoCenter={handleToggleAutoCenter}
        autoCenter={autoCenter}
        onTogglePOIs={handleTogglePOIs}
        showPOIs={showPOIs}
        onToggleCluster={handleToggleCluster}
        showCluster={showCluster}
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
        pois={pois}
        visiblePoiIds={visiblePoiIds}
        togglePoiVisibility={togglePoiVisibility}
        onSelectPOI={handleSelectPOI}
        isLoading={isLoading}
      />
       <VehicleDetailsSheet
        device={selectedDevice}
        onClose={handleDeselectDevice}
        onFollow={handleFollowDevice}
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
