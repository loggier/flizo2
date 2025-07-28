
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import type { MapType } from '@/app/maps/page';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};

interface MapComponentProps {
    mapType: MapType;
    onMapLoad: (map: google.maps.Map | null) => void;
    userPosition: google.maps.LatLngLiteral | null;
    heading: number;
}

function MapComponent({ mapType, onMapLoad, userPosition, heading }: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

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
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

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
      anchor: new window.google.maps.Point(0, 2.6)
  } : undefined;

  const userCircleIcon = (typeof window !== 'undefined' && window.google) ? {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 14,
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
  } : undefined;


  return (
    <LoadScript
      googleMapsApiKey={apiKey}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            disableDefaultUI: true,
            scrollwheel: true,
            streetViewControl: true,
        }}
      >
        {userPosition && (
          <>
            <MarkerF
              position={userPosition}
              icon={userCircleIcon}
              title="Tu ubicación"
              zIndex={99}
            />
            <MarkerF
              position={userPosition}
              icon={userLocationIcon}
              title={`Tu ubicación (Rumbo: ${heading.toFixed(0)}°)`}
              zIndex={100}
            />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MapComponent);
