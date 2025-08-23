
"use client";

import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import type { HistoryPoint } from '@/lib/types';
import { Clock, Gauge } from 'lucide-react';

interface HistoryPlaybackInfoProps {
  point: HistoryPoint;
}

const HistoryPlaybackInfo = ({ point }: HistoryPlaybackInfoProps) => {
  if (!point || !point.lat || !point.lng) return null;

  const position = { lat: point.lat, lng: point.lng };
  const [, time] = point.time.split(' ');

  const labelContainerStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    border: '1px solid #ccc',
    overflow: 'hidden',
    padding: '4px 8px',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#333'
  };

  const anchorStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '8px solid white',
    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
    transform: 'translateX(-50%)',
    bottom: '-8px',
    left: '50%',
  }

  const infoItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height + 40), // Position above the anchor + marker height
      })}
    >
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <div style={labelContainerStyle}>
          <div style={infoItemStyle}>
            <Clock className="h-3 w-3 text-gray-600" />
            <span>{time}</span>
          </div>
          <div style={infoItemStyle}>
            <Gauge className="h-3 w-3 text-gray-600" />
            <span>{point.speed} km/h</span>
          </div>
        </div>
        <div style={anchorStyle} />
      </div>
    </OverlayView>
  );
};

export default React.memo(HistoryPlaybackInfo);
