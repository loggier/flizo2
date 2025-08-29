
"use client";

import React from "react";
import type { Device } from "@/lib/types";
import { MarkerF, OverlayView } from '@react-google-maps/api';
import DeviceLabel from './device-label';
import { Pin } from 'lucide-react';

interface DeviceMarkerProps {
    device: Device;
    onLoad: (marker: google.maps.Marker | null) => void;
    onClick: () => void;
    zoom: number;
    showLabels: boolean;
    isFollowed: boolean;
}

const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';

const DeviceMarker = ({ device, onLoad, onClick, zoom, showLabels, isFollowed }: DeviceMarkerProps) => {
    if (!device.lat || !device.lng) return null;

    const position = { lat: device.lat, lng: device.lng };
    const deviceIconUrl = device.icon ? `${serverUrl}${device.icon.path}` : `https://placehold.co/80x80.png`;

    const deviceIcon =
        typeof window !== 'undefined' && window.google && device.icon
            ? {
                url: deviceIconUrl,
                scaledSize: new window.google.maps.Size(
                    device.icon.width,
                    device.icon.height
                ),
                anchor: new window.google.maps.Point(
                    device.icon.width / 2,
                    device.icon.height / 2
                ),
            }
            : undefined;

    return (
        <>
            <MarkerF
                position={position}
                onLoad={(marker) => onLoad(marker)}
                onClick={onClick}
                icon={deviceIcon}
                title={device.name}
                zIndex={isFollowed ? 1001 : 100}
            />
            {showLabels && zoom >= 17 && <DeviceLabel device={device} />}
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
