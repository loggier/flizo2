
"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Polyline, Marker } from '@react-google-maps/api';
import type { HistoryData } from '@/lib/types';
import { LoaderIcon } from '../icons/loader-icon';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface HistoryMapProps {
  history: HistoryData;
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
      .map(point => ({ lat: point.lat, lng: point.lng }));
  }, [history]);

  const startPoint = routePath.length > 0 ? routePath[0] : null;
  const endPoint = routePath.length > 0 ? routePath[routePath.length - 1] : null;

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    if (map && routePath.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routePath.forEach(point => bounds.extend(point));
      map.fitBounds(bounds);
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
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          geodesic: true,
        }}
      />
      {startPoint && <Marker position={startPoint} title="Inicio" icon={startIcon} />}
      {endPoint && <Marker position={endPoint} title="Fin" icon={endIcon} />}
    </GoogleMap>
  );
}

export default React.memo(HistoryMap);
