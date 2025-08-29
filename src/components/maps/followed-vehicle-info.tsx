
"use client";

import type { Device } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Gauge, Car } from 'lucide-react';
import { format } from 'date-fns';

interface FollowedVehicleInfoProps {
  device: Device;
}

export default function FollowedVehicleInfo({ device }: FollowedVehicleInfoProps) {
  if (!device) return null;

  const lastUpdateTime = device.timestamp ? format(new Date(device.timestamp * 1000), 'dd/MM/yyyy HH:mm:ss') : 'N/A';

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-xs">
      <Card className="bg-background/90 backdrop-blur-sm shadow-lg border border-border">
        <CardContent className="p-3">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <Car className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="truncate">{device.name}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4" />
                    <span>{device.speed} {device.distance_unit_hour}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{lastUpdateTime}</span>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
