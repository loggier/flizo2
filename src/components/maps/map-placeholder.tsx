
"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer, Clusterer } from '@googlemaps/markerclusterer';
import type { MapType } from '@/app/maps/page';
import type { Device, Geofence, Route, POI, AlertEvent } from '@/lib/types';
import GeofenceMarker from './geofence-marker';
import RouteMarker from './route-marker';
import PoiMarker from './poi-marker';
import { LoaderIcon } from '../icons/loader-icon';
import ZoomControls from './zoom-controls';
import DeviceMarker from './device-marker';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

const clustererStyles: any = [
    {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="28" stroke="hsl(var(--primary))" stroke-opacity="0.2" stroke-width="2" fill="none"/>
                <circle cx="30" cy="30" r="22" stroke="hsl(var(--primary))" stroke-opacity="0.4" stroke-width="2" fill="none"/>
                <circle cx="30" cy="30" r="16" stroke="hsl(var(--primary))" stroke-opacity="0.6" stroke-width="2" fill="none"/>
                <circle cx="30" cy="30" r="10" fill="hsl(var(--primary))"/>
            </svg>
        `),
        width: 60,
        height: 60,
        textColor: 'white',
        textSize: 14,
        fontWeight: 'bold',
    },
    {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="38" stroke="hsl(var(--primary))" stroke-opacity="0.2" stroke-width="2" fill="none"/>
                <circle cx="40" cy="40" r="30" stroke="hsl(var(--primary))" stroke-opacity="0.4" stroke-width="2" fill="none"/>
                <circle cx="40" cy="40" r="22" stroke="hsl(var(--primary))" stroke-opacity="0.6" stroke-width="2" fill="none"/>
                <circle cx="40" cy="40" r="14" fill="hsl(var(--primary))"/>
            </svg>
        `),
        width: 80,
        height: 80,
        textColor: 'white',
        textSize: 16,
        fontWeight: 'bold',
    },
    {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" stroke="hsl(var(--primary))" stroke-opacity="0.2" stroke-width="2" fill="none"/>
                <circle cx="50" cy="50" r="38" stroke="hsl(var(--primary))" stroke-opacity="0.4" stroke-width="2" fill="none"/>
                <circle cx="50" cy="50" r="28" stroke="hsl(var(--primary))" stroke-opacity="0.6" stroke-width="2" fill="none"/>
                <circle cx="50" cy="50" r="18" fill="hsl(var(--primary))"/>
            </svg>
        `),
        width: 100,
        height: 100,
        textColor: 'white',
        textSize: 18,
        fontWeight: 'bold',
    }
];


interface MapComponentProps {
    mapType: MapType;
    onMapLoad: (map: google.maps.Map | null) => void;
    userPosition: google.maps.LatLngLiteral | null;
    heading: number;
    devices: Device[];
    geofences: Geofence[];
    routes: Route[];
    pois: POI[];
    showLabels: boolean;
    onSelectDevice: (device: Device) => void;
    onDeselectDevice: () => void;
    selectedAlert?: AlertEvent | null;
    selectedDeviceForAlert?: Device | null;
    followedDevice?: Device | null;
}

function MapComponent({ 
    mapType, 
    onMapLoad, 
    userPosition, 
    heading, 
    devices, 
    geofences, 
    routes,
    pois, 
    showLabels, 
    onSelectDevice, 
    onDeselectDevice,
    selectedAlert,
    selectedDeviceForAlert,
    followedDevice,
}: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const [zoom, setZoom] = useState(10);
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const [clusterer, setClusterer] = useState<Clusterer | null>(null);
  const [markers, setMarkers] = useState<Record<string, google.maps.Marker>>({});


  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ['marker'],
  });

  const handleZoomChanged = useCallback(() => {
    if (map) {
        setZoom(map.getZoom() || 10);
    }
  }, [map]);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    const osmMapType = new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
        if (!coord || zoom === undefined) return null;
        const tilesPerGlobe = 1 << zoom;
        let x = coord.x % tilesPerGlobe;
        if (x < 0) x = tilesPerGlobe + x;
        return `https://mt0.google.com/vt/lyrs=m&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
      },
      tileSize: new google.maps.Size(256, 256),
      name: "Normal",
      maxZoom: 18
    });

    const satelliteMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) return null;
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) x = tilesPerGlobe + x;
            const subdomain = ['mt0', 'mt1', 'mt2', 'mt3'][coord.x % 4];
            return `https://${subdomain}.google.com/vt/lyrs=y&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Satellite',
        maxZoom: 20
    });

    const trafficMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (!coord || zoom === undefined) return null;
            const tilesPerGlobe = 1 << zoom;
            let x = coord.x % tilesPerGlobe;
            if (x < 0) x = tilesPerGlobe + x;
            const subdomain = ['mt0', 'mt1', 'mt2', 'mt3'][coord.x % 4];
            return `https://${subdomain}.google.com/vt/lyrs=m@221097413,traffic&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Traffic',
        maxZoom: 20
    });
    
    mapInstance.mapTypes.set("OSM", osmMapType);
    mapInstance.mapTypes.set("SATELLITE", satelliteMapType);
    mapInstance.mapTypes.set("TRAFFIC", trafficMapType);
    
    setMap(mapInstance);
    onMapLoad(mapInstance);

    const newClusterer = new MarkerClusterer({ 
        map: mapInstance, 
        markers: [],
        renderer: {
            render: ({ count, position }) => {
                const style = clustererStyles.find(s => count < (s.maxCount || Infinity)) || clustererStyles[clustererStyles.length - 1];
                const svg = window.btoa(`
                    <svg fill="${style.color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
                        <circle cx="120" cy="120" r="70" opacity=".6" />
                        <circle cx="120" cy="120" r="90" opacity=".3" />
                        <circle cx="120" cy="120" r="110" opacity=".2" />
                        <text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="90" dy=".3em" font-weight="bold">${count}</text>
                    </svg>`);
                return new google.maps.Marker({
                    position,
                    icon: {
                        url: `data:image/svg+xml;base64,${svg}`,
                        scaledSize: new google.maps.Size(45, 45),
                    },
                    label: {
                        text: String(count),
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "12px",
                    },
                    // adjust zIndex to be above other markers
                    zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
                });
            }
        }
    });
    setClusterer(newClusterer);

  }, [onMapLoad]);

  useEffect(() => {
    if (clusterer) {
        clusterer.clearMarkers();
        clusterer.addMarkers(Object.values(markers));
    }
  }, [clusterer, markers]);
  
  const setMarkerRef = useCallback((marker: google.maps.Marker | null, key: string) => {
    setMarkers(prevMarkers => {
        if (marker) {
            return {...prevMarkers, [key]: marker};
        } else {
            const newMarkers = {...prevMarkers};
            delete newMarkers[key];
            return newMarkers;
        }
    });
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    onMapLoad(null);
  }, [onMapLoad]);

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  if (!isLoaded) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <div className="flex flex-col items-center gap-4">
                <LoaderIcon className="h-10 w-10 text-primary" />
                <p className="font-semibold text-primary">Cargando Mapa...</p>
            </div>
        </div>
    );
  }
  
  if (!apiKey) {
    return <div>API Key for Google Maps is missing. Please check your environment variables.</div>;
  }
  
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 0;
      map.setZoom(currentZoom - 1);
    }
  };

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onDeselectDevice}
        onZoomChanged={handleZoomChanged}
        options={{
            disableDefaultUI: true,
            scrollwheel: true,
            streetViewControl: false,
        }}
      >
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        
        {devices.map((device) => (
            <DeviceMarker
                key={device.id}
                map={map}
                device={device}
                onLoad={(marker) => setMarkerRef(marker, device.id.toString())}
                onUnload={() => setMarkerRef(null, device.id.toString())}
                onSelectDevice={onSelectDevice}
                showLabels={showLabels}
                followedDevice={followedDevice}
            />
        ))}

        {geofences.map(geofence => (
          <GeofenceMarker key={`geofence-${geofence.id}`} geofence={geofence} />
        ))}
        {routes.map(route => (
          <RouteMarker key={`route-${route.id}`} route={route} />
        ))}
        {pois.map(poi => (
          <PoiMarker key={`poi-${poi.id}`} poi={poi} />
        ))}
        {selectedAlert && selectedDeviceForAlert && (
          <InfoWindow
            position={{ lat: selectedAlert.latitude, lng: selectedAlert.longitude }}
            onCloseClick={onDeselectDevice}
            options={{
              pixelOffset: new window.google.maps.Size(0, - (selectedDeviceForAlert?.icon?.height || 30) ),
            }}
          >
             <div className="bg-white p-1 rounded-lg max-w-sm">
                <h4 className="font-bold text-sm mb-1">{selectedAlert.device_name}</h4>
                <p className="text-xs text-gray-600"><strong>Dirección:</strong> {selectedAlert.address}</p>
                <p className="text-xs text-gray-600"><strong>Fecha:</strong> {selectedAlert.time}</p>
                <p className="text-xs text-gray-600"><strong>Posición:</strong> {selectedAlert.latitude}, {selectedAlert.longitude}</p>
                <p className="text-xs text-gray-600"><strong>Velocidad:</strong> {selectedAlert.speed} km/h</p>
                <p className="text-xs text-gray-600"><strong>Evento:</strong> {selectedAlert.message}</p>
             </div>
          </InfoWindow>
        )}
      </GoogleMap>
  );
}

export default React.memo(MapComponent);
