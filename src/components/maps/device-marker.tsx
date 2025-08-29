
"use client";

import React from 'react';
import { MarkerF, OverlayView } from '@react-google-maps/api';
import type { Device } from '@/lib/types';
import DeviceLabel from './device-label';
import { Pin } from 'lucide-react';
import type { MarkerClusterer } from '@googlemaps/markerclusterer';

interface DeviceMarkerProps {
  device: Device;
  clusterer: MarkerClusterer;
  onSelectDevice: (device: Device) => void;
  showLabels: boolean;
  isFollowed: boolean;
}

const DeviceMarker = ({ device, clusterer, onSelectDevice, showLabels, isFollowed }: DeviceMarkerProps) => {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  if (!device.lat || !device.lng) return null;

  const deviceIcon = (typeof window !== 'undefined' && window.google && device.icon) ? {
    url: `${serverUrl}${device.icon.path}`,
    scaledSize: new window.google.maps.Size(device.icon.width, device.icon.height),
    anchor: new window.google.maps.Point(device.icon.width / 2, device.icon.height / 2),
  } : undefined;

  const position = { lat: device.lat, lng: device.lng };

  return (
    <>
      <MarkerF
        position={position}
        title={device.name}
        icon={deviceIcon}
        // @ts-ignore // rotation is not in the type definition but it works
        rotation={device.course}
        clusterer={clusterer}
        onClick={() => onSelectDevice(device)}
      />
      {showLabels && <DeviceLabel device={device} />}
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
    </>
  );
};

export default React.memo(DeviceMarker);
