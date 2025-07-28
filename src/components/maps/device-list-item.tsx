
"use client";

import type { Device } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import { Car, Clock, WifiOff, Zap, AlertTriangle, KeySquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceListItemProps {
  device: Device;
}

const getStatusInfo = (device: Device): { text: string, color: string, icon: React.ReactNode } => {
    switch (device.online) {
      case 'moving':
        return { text: 'En movimiento', color: 'text-green-600', icon: <Car className="h-4 w-4" /> };
      case 'online':
        return { text: 'Detenido', color: 'text-yellow-600', icon: <Car className="h-4 w-4" /> };
      case 'engine':
        return { text: 'Motor Encendido', color: 'text-yellow-600', icon: <Zap className="h-4 w-4" /> };
      case 'stopped':
        return { text: 'Detenido', color: 'text-yellow-600', icon: <Car className="h-4 w-4" /> };
      case 'ack':
        return { text: 'Detenido', color: 'text-yellow-600', icon: <Car className="h-4 w-4" /> };
      case 'offline':
        return { text: 'No conectado', color: 'text-red-600', icon: <WifiOff className="h-4 w-4" /> };
      default:
        return { text: 'Desconocido', color: 'text-gray-500', icon: <AlertTriangle className="h-4 w-4" /> };
    }
  };

export default function DeviceListItem({ device }: DeviceListItemProps) {
    const status = getStatusInfo(device);

    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Checkbox id={`device-${device.id}`} />
                    <KeySquare className="h-5 w-5 text-primary"/>
                    <span className="font-bold">{device.name}</span>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-200">
                    <div className="text-center">
                        <p className="font-bold text-lg">{device.speed}</p>
                        <p className="text-xs text-gray-500">{device.distance_unit_hour}</p>
                    </div>
                </div>
            </div>
            <div className="mt-2 space-y-2 pl-10 text-sm text-gray-600">
                <div className={cn("flex items-center gap-2", status.color)}>
                    {status.icon}
                    <span>{status.text}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Conexión: {new Date(device.timestamp * 1000).toLocaleString()}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Online: {device.time}</span>
                </div>
            </div>
        </div>
    )
}
