
"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, useLoadScript, Polyline, Marker, InfoWindow } from '@react-google-maps/api';
import type { HistoryData, HistoryItem, HistoryPoint } from '@/lib/types';
import { LoaderIcon } from '../icons/loader-icon';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';

const getIconForStatus = (status: number) => {
    if (typeof window === 'undefined' || !window.google) return null;

    const iconSize = new google.maps.Size(32, 32);

    switch (status) {
        case 1: // Start - handled separately but can have a default
            return {
                url: `${serverUrl}assets/images/route_start.png`,
                scaledSize: iconSize
            };
        case 2: // Stop
            return {
                url: `${serverUrl}assets/images/route_stop.png`,
                scaledSize: iconSize
            };
        case 3: // Idle - Let's use stop icon for now
             return {
                url: `${serverUrl}assets/images/route_stop.png`,
                scaledSize: iconSize
            };
        case 4: // End - handled separately
            return null;
        case 5: // Event
            return {
                url: `${serverUrl}assets/images/route_event.png`,
                scaledSize: iconSize
            };
        default:
            return null;
    }
}


function HistoryMap({ 
    history, 
    onMapLoad,
    selectedPoint,
    onCloseInfoWindow,
    playbackPosition,
    isPlaying,
    routePath,
 }: { 
    history: HistoryData, 
    onMapLoad: (map: google.maps.Map | null) => void,
    selectedPoint: HistoryPoint | null,
    onCloseInfoWindow: () => void,
    playbackPosition: { lat: number; lng: number } | null,
    isPlaying: boolean,
    routePath: { lat: number; lng: number }[];
 }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const allPoints = useMemo(() => {
    return history.items
      .flatMap(group => group.items)
      .map(point => {
        const lat = parseFloat(point.lat as any);
        const lng = parseFloat(point.lng as any);
        return { lat, lng };
      })
      .filter(point => !isNaN(point.lat) && !isNaN(point.lng));
  }, [history]);

  const eventMarkers = useMemo(() => {
    if (!isLoaded) return [];
    return history.items
      .filter(group => group.status !== 1 && group.items.length > 0) // Filter out 'drive' groups and empty groups
      .map((group: HistoryItem) => {
        const point = group.items[0];
        const lat = parseFloat((point as any).lat ?? (point as any).latitude);
        const lng = parseFloat((point as any).lng ?? (point as any).longitude);

        if (isNaN(lat) || isNaN(lng)) {
            return null;
        }

        return {
          position: { lat, lng },
          icon: getIconForStatus(group.status),
          title: `Status: ${group.status} at ${point.time}`
        };
      }).filter(marker => marker && marker.icon);
  }, [history, isLoaded]);

  const startPoint = allPoints.length > 0 ? allPoints[0] : null;
  const endPoint = allPoints.length > 0 ? allPoints[allPoints.length - 1] : null;

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

    onMapLoad(mapInstance);
    
    if (allPoints.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      allPoints.forEach(point => bounds.extend(point));
      mapInstance.fitBounds(bounds);
      const listener = google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        if (mapInstance.getZoom()! > 16) mapInstance.setZoom(16);
      });
      return () => google.maps.event.removeListener(listener);
    }
  }, [onMapLoad, allPoints]);
  
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
  
  if (loadError || !apiKey) {
    return <div>Error al cargar el mapa. Por favor, revise la API Key de Google Maps.</div>;
  }

  const iconSize = new google.maps.Size(40, 40);

  const startIcon = {
    url: `${serverUrl}assets/images/route_start.png`,
    scaledSize: iconSize
  };

  const endIcon = {
    url: `${serverUrl}assets/images/route_end.png`,
    scaledSize: iconSize
  };
  
  const playbackIcon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
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
        path={allPoints}
        options={{
          strokeColor: '#4978d0',
          strokeOpacity: 1,
          strokeWeight: 3,
          geodesic: true,
        }}
      />
      {!isPlaying && (
          <>
            {startPoint && <Marker position={startPoint} title="Inicio" icon={startIcon} zIndex={10} />}
            {endPoint && <Marker position={endPoint} title="Fin" icon={endIcon} zIndex={10}/>}
            {eventMarkers.map((marker, index) => (
                marker ? <Marker key={index} position={marker.position} icon={marker.icon as google.maps.Icon} title={marker.title} /> : null
            ))}
          </>
      )}

      {isPlaying && playbackPosition && (
          <Marker position={playbackPosition} icon={playbackIcon} title="Vehículo" zIndex={999} />
      )}

      {selectedPoint && (
          <InfoWindow
            position={{ lat: parseFloat(selectedPoint.lat as any), lng: parseFloat(selectedPoint.lng as any) }}
            onCloseClick={onCloseInfoWindow}
          >
             <div className="p-1 text-sm">
                <p><strong>Hora:</strong> {selectedPoint.time}</p>
                <p><strong>Velocidad:</strong> {selectedPoint.speed} kph</p>
                {selectedPoint.address && <p><strong>Dirección:</strong> {selectedPoint.address}</p>}
             </div>
          </InfoWindow>
        )}
    </GoogleMap>
  );
}

export default React.memo(HistoryMap);

    