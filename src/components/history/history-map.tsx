
"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Polyline, Marker } from '@react-google-maps/api';
import type { HistoryData, HistoryItem } from '@/lib/types';
import { LoaderIcon } from '../icons/loader-icon';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface HistoryMapProps {
  history: HistoryData;
}

const getIconForStatus = (status: number) => {
    switch (status) {
        case 1: // Drive - No specific icon, part of the polyline
            return null; 
        case 2: // Stop
            return {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
        case 3: // Idle
            return {
                url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
        case 4: // End
             return {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            };
        case 5: // Event
            return {
                url: 'http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png',
                scaledSize: new google.maps.Size(40, 40)
            };
        default:
            return null;
    }
}


function HistoryMap({ history }: HistoryMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const routePath = useMemo(() => {
    return history.items
      .flatMap(group => group.items)
      .filter(point => typeof point.lat === 'number' && typeof point.lng === 'number' && isFinite(point.lat) && isFinite(point.lng))
      .map(point => ({ lat: point.lat, lng: point.lng }));
  }, [history]);

  const eventMarkers = useMemo(() => {
    return history.items
      .filter(group => group.status !== 1 && group.items.length > 0) // Filter out 'drive' groups and empty groups
      .map((group: HistoryItem) => {
        const point = group.items[0];
        if (typeof point.lat !== 'number' || typeof point.lng !== 'number' || !isFinite(point.lat) || !isFinite(point.lng)) {
            return null;
        }
        return {
          position: { lat: point.lat, lng: point.lng },
          icon: getIconForStatus(group.status),
          title: `Status: ${group.status} at ${point.time}`
        };
      }).filter(marker => marker && marker.icon);
  }, [history]);

  const startPoint = routePath.length > 0 ? routePath[0] : null;
  const endPoint = routePath.length > 0 ? routePath[routePath.length - 1] : null;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    const osmMapType = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
          if (!coord || zoom === undefined) return null;
          const tilesPerGlobe = 1 << zoom;
          let x = coord.x % tilesPerGlobe;
          if (x < 0) x = tilesPerGlobe + x;
          return `https://mt0.google.com/vt/lyrs=m&x=${x}&y=${coord.y}&z=${zoom}&s=Ga`;
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        maxZoom: 18
      });
  
      mapInstance.mapTypes.set("OSM", osmMapType);
      mapInstance.setMapTypeId("OSM");

    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (map && routePath.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routePath.forEach(point => bounds.extend(point));
      map.fitBounds(bounds, 50); // Add 50px padding
    }
  }, [map, routePath]);
  
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
    return <div>API Key for Google Maps is missing.</div>;
  }

  const startIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: new google.maps.Size(40, 40)
  };

  const endIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: new google.maps.Size(40, 40)
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={startPoint || { lat: 0, lng: 0 }}
      zoom={12}
      onLoad={onLoad}
      options={{ disableDefaultUI: true, scrollwheel: true }}
    >
      <Polyline
        path={routePath}
        options={{
          strokeColor: '#4978d0',
          strokeOpacity: 1,
          strokeWeight: 3,
          geodesic: true,
        }}
      />
      {startPoint && <Marker position={startPoint} title="Inicio" icon={startIcon} />}
      {endPoint && <Marker position={endPoint} title="Fin" icon={endIcon} />}
      {eventMarkers.map((marker, index) => (
        marker ? <Marker key={index} position={marker.position} icon={marker.icon as google.maps.Icon} title={marker.title} /> : null
      ))}
    </GoogleMap>
  );
}

export default React.memo(HistoryMap);
