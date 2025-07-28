
import Image from "next/image";
import type { Device } from "@/lib/types";
import { cn } from "@/lib/utils";
import { KeySquare, Clock, Power, Phone } from "lucide-react";

interface VehicleCardProps {
  device: Device;
}

const getStatusInfo = (device: Device): { bgColor: string, textColor: string } => {
  switch (device.online) {
    case 'moving':
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
    case 'engine':
    case 'online':
    case 'stopped':
    case 'ack':
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    case 'offline':
      return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  }
};

export function VehicleCard({ device }: VehicleCardProps) {
  const { bgColor, textColor } = getStatusInfo(device);
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const deviceIconUrl = device.icon ? `${serverUrl}${device.icon.path}` : `https://placehold.co/80x80.png`;

  return (
    <div className={cn("flex items-center p-4 rounded-xl shadow-md gap-4", bgColor, textColor)}>
      <div className="flex-shrink-0">
        <Image
          src={deviceIconUrl}
          alt={device.name}
          width={64}
          height={64}
          className="w-16 h-16 object-contain"
        />
      </div>

      <div className="flex-1 space-y-1.5 text-xs">
        <h3 className="font-bold text-base">{device.name}</h3>
        
        <div className="flex items-center gap-2">
          <KeySquare className="w-4 h-4" />
          <span>{device.plate_number || 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Últ. Conexión: {new Date(device.timestamp * 1000).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Power className="w-4 h-4" />
          <span>Online: {device.time}</span>
        </div>

        {device.device_data?.sim_number && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Número: {device.device_data.sim_number}</span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 text-center">
        <p className="font-bold text-2xl">{device.speed}</p>
        <p className="text-sm">{device.distance_unit_hour}</p>
      </div>
    </div>
  );
}

