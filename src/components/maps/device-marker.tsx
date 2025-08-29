
"use client";

import React, { useEffect, useState } from "react";
import { MarkerF, OverlayView, Polyline } from "@react-google-maps/api";
import type { Device } from "@/lib/types";
import DeviceLabel from "./device-label";
import { Pin } from "lucide-react";

interface DeviceMarkerProps {
  map: google.maps.Map | null;
  device: Device;
  onLoad: (marker: google.maps.Marker) => void;
  onUnload: () => void;
  onSelectDevice: (device: Device) => void;
  showLabels: boolean;
  followedDevice: Device | null;
}

const DeviceMarker = ({
  map,
  device,
  onLoad,
  onUnload,
  onSelectDevice,
  showLabels,
  followedDevice,
}: DeviceMarkerProps) => {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const [zoom, setZoom] = useState(map?.getZoom() || 10);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 10);
    });
    return () => google.maps.event.removeListener(listener);
  }, [map]);

  if (!device.lat || !device.lng) return null;

  const deviceIcon =
    typeof window !== 'undefined' && window.google && device.icon
      ? {
          url: `${serverUrl}${device.icon.path}`,
          scaledSize: new window.google.maps.Size(
            device.icon.width,
            device.icon.height
          ),
          anchor: new window.google.maps.Point(
            device.icon.width / 2,
            device.icon.height / 2
          ),
          rotation: device.course,
        }
      : undefined;

  const position = { lat: device.lat, lng: device.lng };
  const shouldShowLabel = showLabels && zoom >= 17;

  return (
    <>
      <MarkerF
        position={position}
        title={device.name}
        icon={deviceIcon}
        zIndex={101}
        onClick={() => onSelectDevice(device)}
        onLoad={onLoad}
        onUnmount={onUnload}
      />
      {shouldShowLabel && <DeviceLabel device={device} />}
      {followedDevice?.id === device.id && (
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
    </>
  );
};

export default React.memo(DeviceMarker);
