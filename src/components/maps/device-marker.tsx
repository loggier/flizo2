
"use client";

import React, { useEffect, useState } from 'react';
import { MarkerF, Polyline, OverlayView } from '@react-google-maps/api';
import type { Device } from '@/lib/types';
import DeviceLabel from './device-label';
import { Pin } from 'lucide-react';
import type { MarkerClusterer } from '@googlemaps/markerclusterer';

interface DeviceMarkerProps {
  device: Device;
  isUserLocation: boolean;
  userLocationIcon?: google.maps.Symbol;
  userCircleIcon?: google.maps.Symbol;
  showLabel: boolean;
  onSelect: (device: Device) => void;
  isFollowed?: boolean;
  clusterer: MarkerClusterer | undefined;
  mapZoom: number;
}

const DeviceMarker = ({ 
  device, 
  isUserLocation, 
  userLocationIcon, 
  userCircleIcon,
  showLabel,
  onSelect,
  isFollowed = false,
  clusterer,
  mapZoom,
}: DeviceMarkerProps) => {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  
  if (!device.lat || !device.lng) {
    return null;
  }
  
  const position = { lat: device.lat, lng: device.lng };

  const deviceIcon = (typeof window !== 'undefined' && window.google && device.icon) ? {
      url: `${serverUrl}${device.icon.path}`,
      scaledSize: new window.google.maps.Size(device.icon.width, device.icon.height),
      anchor: new window.google.maps.Point(device.icon.width / 2, device.icon.height / 2),
      rotation: device.course,
  } : undefined;

  if (isUserLocation) {
    return (
      <>
        <MarkerF
          position={position}
          icon={userCircleIcon}
          title={device.name}
          zIndex={99}
        />
        <MarkerF
          position={position}
          icon={userLocationIcon}
          title={`${device.name} (Rumbo: ${device.course.toFixed(0)}°)`}
          zIndex={100}
        />
      </>
    );
  }

  const pinLabelStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, -100%)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 5px',
    borderRadius: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    border: '1px solid #ccc',
  };

  const shouldShowLabel = showLabel && mapZoom >= 17;

  return (
    <React.Fragment>
      <MarkerF
        position={position}
        title={device.name}
        icon={deviceIcon}
        zIndex={101}
        onClick={() => onSelect(device)}
        clusterer={clusterer}
      />
      {shouldShowLabel && <DeviceLabel device={device} />}
      {isFollowed && (
        <OverlayView
          position={position}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(width, height) => ({
            x: 0,
            y: -(height + (device.icon?.height ? device.icon.height / 2 : 20) + 30),
          })}
        >
          <Pin className="h-6 w-6 text-primary animate-bounce" fill="currentColor" />
        </OverlayView>
      )}
      {device.tail && device.tail.length > 0 && (
        <Polyline
          path={device.tail.map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))}
          options={{
            strokeColor: device.device_data.tail_color,
            strokeWeight: 2,
            strokeOpacity: 0.8,
            zIndex: 100,
          }}
        />
      )}
    </React.Fragment>
  );
};

export default React.memo(DeviceMarker);

    