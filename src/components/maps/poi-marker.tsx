
"use client";

import React, { useState, useMemo } from 'react';
import { MarkerF, InfoWindow } from '@react-google-maps/api';
import type { POI } from '@/lib/types';

interface PoiMarkerProps {
  poi: POI;
}

const PoiMarker = ({ poi }: PoiMarkerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';

  const position = useMemo(() => poi.parsedCoordinates, [poi.parsedCoordinates]);
  
  const icon = useMemo(() => {
    if (typeof window === 'undefined' || !window.google) return undefined;
    const iconUrl = poi.map_icon.url.startsWith('http') ? poi.map_icon.url : `${serverUrl}${poi.map_icon.path}`;

    return {
      url: iconUrl,
      scaledSize: new window.google.maps.Size(poi.map_icon.width, poi.map_icon.height),
      anchor: new window.google.maps.Point(poi.map_icon.width / 2, poi.map_icon.height / 2),
    };
  }, [poi.map_icon, serverUrl]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (!position) return null;

  return (
    <MarkerF
      position={position}
      icon={icon}
      title={poi.name}
      onClick={handleToggleOpen}
    >
      {isOpen && (
        <InfoWindow position={position} onCloseClick={handleToggleOpen}>
          <div className="p-1">
            <h4 className="font-bold text-base">{poi.name}</h4>
            <p className="text-sm">{poi.description}</p>
          </div>
        </InfoWindow>
      )}
    </MarkerF>
  );
};

export default React.memo(PoiMarker);
