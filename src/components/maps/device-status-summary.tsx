"use client";

import React, { useMemo } from 'react';
import type { Device } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeviceStatusSummaryProps {
  devices: Device[];
}

const StatusCircle = ({ color, count }: { color: string; count: number }) => (
  <div
    className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full font-bold text-base shadow-lg",
        color === 'yellow' ? 'text-black' : 'text-white'
    )}
    style={{ backgroundColor: color }}
  >
    {count}
  </div>
);

const DeviceStatusSummary = ({ devices }: DeviceStatusSummaryProps) => {
  const summary = useMemo(() => {
    const counts = {
      moving: 0,
      stopped: 0,
      offline: 0,
    };

    devices.forEach(device => {
      switch (device.online) {
        case 'moving':
          counts.moving++;
          break;
        case 'engine':
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
        { color: 'yellow', count: counts.stopped, key: 'stopped' },
        { color: 'red', count: counts.offline, key: 'offline' },
    ];
  }, [devices]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2">
        {summary.map(item => (
          <StatusCircle key={item.key} color={item.color} count={item.count} />
        ))}
      </div>
    </div>
  );
};

export default DeviceStatusSummary;
