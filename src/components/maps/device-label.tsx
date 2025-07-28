
"use client";

import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import type { Device } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeviceLabelProps {
  device: Device;
}

const getStatusColor = (device: Device): string => {
  const { online, icon_colors } = device;
  switch (online) {
    case 'moving':
      return icon_colors.moving || 'green';
    case 'online':
      return icon_colors.moving || 'green'; // online but not moving -> stopped
    case 'engine':
      return icon_colors.engine || 'yellow';
    case 'stopped':
      return icon_colors.stopped || 'yellow';
    case 'ack':
       return icon_colors.stopped || 'yellow';
    case 'offline':
      return icon_colors.offline || 'red';
    default:
      return 'grey';
  }
};

const DeviceLabel = ({ device }: DeviceLabelProps) => {
  if (!device.lat || !device.lng) return null;

  const position = { lat: device.lat, lng: device.lng };
  const color = getStatusColor(device);
  
  // Define styles using CSS-in-JS to apply dynamic colors
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translateX(-50%)',
    bottom: '100%', // Position above the anchor point
    padding: '4px 8px',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: color,
    fontWeight: '500',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 150, // Higher than markers
  };

  const anchorStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: `6px solid ${color}`,
    transform: 'translateX(-50%)',
    bottom: '-6px', // Connects to the main label body
    left: '50%',
  }

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height + 10 + (device.icon?.height ? device.icon.height / 2 : 20)), // position above icon
      })}
    >
      <div style={labelStyle}>
        {device.name} ({device.speed} {device.distance_unit_hour})
        <div style={anchorStyle} />
      </div>
    </OverlayView>
  );
};

export default React.memo(DeviceLabel);
