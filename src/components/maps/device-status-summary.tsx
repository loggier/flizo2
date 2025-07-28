
"use client";

import React, { useMemo } from 'react';
import type { Device } from '@/lib/types';

interface DeviceStatusSummaryProps {
  devices: Device[];
}

const StatusCircle = ({ color, count }: { color: string; count: number }) => (
  <div
    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg"
    style={{ backgroundColor: color }}
  >
    {count}
  </div>
);

const DeviceStatusSummary = ({ devices }: DeviceStatusSummaryProps) => {
  const summary = useMemo(() => {
    const counts = {
      moving: 0,
      engineOn: 0,
      stopped: 0,
      offline: 0,
    };

    devices.forEach(device => {
      switch (device.online) {
        case 'moving':
          counts.moving++;
          break;
        case 'engine':
          counts.engineOn++;
          break;
        case 'online':
        case 'stopped':
        case 'ack':
          counts.stopped++;
          break;
        case 'offline':
          counts.offline++;
          break;
        default:
          break;
      }
    });

    return [
        { color: 'green', count: counts.moving, key: 'moving' },
        { color: 'yellow', count: counts.engineOn, key: 'engineOn' },
        { color: 'orange', count: counts.stopped, key: 'stopped' },
        { color: 'red', count: counts.offline, key: 'offline' },
    ];
  }, [devices]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm">
        {summary.map(item => (
          item.count > 0 && <StatusCircle key={item.key} color={item.color} count={item.count} />
        ))}
      </div>
    </div>
  );
};

export default DeviceStatusSummary;
