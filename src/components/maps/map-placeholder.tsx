
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, MarkerClustererF } from '@react-google-maps/api';
import type { MapType } from '@/app/maps/page';
import type { Device, Geofence, Route, POI, AlertEvent } from '@/lib/types';
import DeviceMarker from './device-marker';
import GeofenceMarker from './geofence-marker';
import RouteMarker from './route-marker';
import PoiMarker from './poi-marker';
import { LoaderIcon } from '../icons/loader-icon';
import ZoomControls from './zoom-controls';
import type { Cluster, Clusterer } from '@googlemaps/markerclusterer';

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
  }, [onMapLoad]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    onMapLoad(null);
  }, [onMapLoad]);

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);
  
  const clusterClickHandler = (cluster: Cluster) => {
    if (!map) return;
    const center = cluster.getCenter();
    if (center) {
        map.panTo(center);
        const currentZoom = map.getZoom() || 0;
        map.setZoom(currentZoom + 2);
    }
  }

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

  const userLocationIcon = (typeof window !== 'undefined' && window.google) ? {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      rotation: heading,
      anchor: new google.maps.Point(0, 2.6)
  } : undefined;

  const userCircleIcon = (typeof window !== 'undefined' && window.google) ? {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#4285F4',
      fillOpacity: 0.3,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
  } : undefined;
  
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
        {userPosition && userLocationIcon && userCircleIcon && (
          <DeviceMarker
            device={{
              id: -1,
              name: 'Tu ubicación',
              lat: userPosition.lat,
              lng: userPosition.lng,
              course: heading,
              speed: 0,
              online: 'ack',
              icon: { path: '', width: 30, height: 30 },
              tail: [],
              icon_colors: { moving: '', stopped: '', offline: '', engine: '', blocked: ''},
              device_data: { tail_color: '#4285F4' }
            } as any}
            isUserLocation={true}
            userLocationIcon={userLocationIcon}
            userCircleIcon={userCircleIcon}
            showLabel={false}
            onSelect={() => {}}
            mapZoom={zoom}
            clusterer={undefined}
          />
        )}
        
        <MarkerClustererF options={{ styles: clustererStyles }} onClick={clusterClickHandler}>
          {(clusterer) =>
            devices.map((device) => (
              <DeviceMarker
                key={device.id}
                device={device}
                isUserLocation={false}
                showLabel={showLabels}
                onSelect={onSelectDevice}
                isFollowed={followedDevice?.id === device.id}
                mapZoom={zoom}
                clusterer={clusterer}
              />
            ))
          }
        </MarkerClustererF>

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

    