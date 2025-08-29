"use client";

import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import type { Device } from '@/lib/types';

interface DeviceLabelProps {
  device: Device;
}

const getStatusColor = (device: Device): string => {
  const { online, icon_colors } = device;
  switch (online) {
    case 'moving':
      return icon_colors.moving || 'green';
    case 'online':
       return icon_colors.stopped || 'yellow';
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
  
  const labelContainerStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translateX(-50%)',
    background: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    border: '1px solid #ccc',
    overflow: 'hidden',
  };

  const colorIndicatorStyle: React.CSSProperties = {
    width: '8px',
    alignSelf: 'stretch',
    backgroundColor: color,
  };

  const textStyle: React.CSSProperties = {
    padding: '4px 8px',
    color: '#333',
    fontWeight: '500',
    fontSize: '12px',
  };
  
  const anchorStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid #FFFFFF',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
    transform: 'translateX(-50%)',
    bottom: '-8px',
    left: '50%',
  }

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height + 10 + (device.icon?.height ? device.icon.height / 2 : 20)),
      })}
    >
      <div style={{ position: 'relative' }}>
        <div style={labelContainerStyle}>
          <div style={colorIndicatorStyle} />
          <div style={textStyle}>
            {device.name} ({device.speed} {device.distance_unit_hour})
          </div>
        </div>
        <div style={anchorStyle} />
      </div>
    </OverlayView>
  );
};

export default React.memo(DeviceLabel);