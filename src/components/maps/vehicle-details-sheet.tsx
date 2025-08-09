
"use client";

import type { Device, Sensor } from "@/lib/types";
import { Button } from "../ui/button";
import Image from "next/image";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  Car,
  Clock,
  Compass,
  FileText,
  History,
  MapPin,
  Send,
  Share2,
  Signal,
  Star,
  Timer,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAddress } from "@/services/flizo.service";

interface VehicleDetailsSheetProps {
  device: Device | null;
  onClose: () => void;
}

const getStatusInfo = (device: Device): { text: string; colorClass: string; icon: React.ReactNode } => {
    switch (device.online) {
      case 'moving':
        return { text: 'En movimiento', colorClass: 'bg-green-500', icon: <Car className="h-4 w-4" /> };
      case 'online':
        return { text: 'Detenido', colorClass: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'engine':
        return { text: 'Motor Encendido', colorClass: 'bg-yellow-500', icon: <Zap className="h-4 w-4" /> };
      case 'stopped':
        return { text: 'Detenido', colorClass: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'ack':
        return { text: 'Detenido', colorClass: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'offline':
        return { text: 'No conectado', colorClass: 'bg-red-500', icon: <WifiOff className="h-4 w-4" /> };
      default:
        return { text: 'Desconocido', colorClass: 'bg-gray-500', icon: <Car className="h-4 w-4" /> };
    }
};

const InfoRow = ({ icon: Icon, value }: { icon: React.ElementType, value: string | React.ReactNode }) => (
    <div className="flex items-center gap-2 text-xs">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="text-gray-600 flex-1 line-clamp-2 h-8">{value}</div>
    </div>
);

export default function VehicleDetailsSheet({ device, onClose }: VehicleDetailsSheetProps) {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const [address, setAddress] = useState('Ubicación no disponible');
  
  useEffect(() => {
    let isMounted = true;
    
    if (device) {
        if (device.address && address === 'Ubicación no disponible') {
            setAddress(device.address);
        }

        if (device.lat && device.lng) {
            getAddress(device.lat, device.lng)
                .then(fetchedAddress => {
                    if (isMounted) {
                        setAddress(fetchedAddress || device.address || 'Ubicación no disponible');
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setAddress(device.address || 'No se pudo obtener la dirección');
                    }
                });
        } else if (!device.address) {
             setAddress('Ubicación no disponible');
        }
    }

    return () => { isMounted = false; };
  }, [device, address]);


  if (!device) return null;

  const status = getStatusInfo(device);
  const deviceIconUrl = device.icon ? `${serverUrl}${device.icon.path}` : `https://placehold.co/80x80.png`;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-2 pointer-events-none">
       <div className="bg-background rounded-xl shadow-2xl overflow-hidden pointer-events-auto max-w-lg mx-auto">

        {/* New Header */}
        <div className="p-3 relative bg-white">
             <Button size="icon" variant="ghost" onClick={onClose} className="absolute top-2 right-2 rounded-full bg-gray-900/10 hover:bg-gray-900/20 h-8 w-8 text-gray-700 z-10">
                <X className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
                <Image
                    src={deviceIconUrl}
                    alt={device.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain rounded-lg p-1 flex-shrink-0"
                />
                <div className="flex-1">
                    <h2 className="font-bold text-xl text-gray-800 truncate">{device.name}</h2>
                    <p className="text-3xl font-bold text-primary">{device.speed} <span className="text-base font-medium text-gray-500">{device.distance_unit_hour}</span></p>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2">
                 <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full text-white", status.colorClass)}>
                    {status.icon}
                    <span>{status.text}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Send className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Share2 className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Compass className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Star className="h-4 w-4 text-gray-600" /></Button>
                </div>
            </div>
        </div>

        <div className="p-2 space-y-2 bg-gray-50">
            <div>
                <h3 className="font-bold text-sm mb-2 text-gray-800 px-1">INFORMACIÓN</h3>
                <div className="space-y-2 p-2 bg-white rounded-lg">
                    <InfoRow icon={MapPin} value={address} />
                    <InfoRow icon={Clock} value={new Date(device.timestamp * 1000).toLocaleString()} />
                    <InfoRow icon={Signal} value={formatTimeAgo(device.timestamp)} />
                    <InfoRow icon={Timer} value={device.stop_duration} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
                <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100"><History className="mr-2"/> Historial</Button>
                <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100"><FileText className="mr-2"/> Reportes</Button>
            </div>

            {device.sensors && device.sensors.length > 0 && (
                <div className="bg-white rounded-lg p-2 mt-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {device.sensors.map((sensor: Sensor) => (
                           <div key={sensor.id} className="text-xs">
                                <span className="font-semibold text-gray-600" dangerouslySetInnerHTML={{ __html: sensor.name + ':' }} />
                                {' '}
                                <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: sensor.value }} />
                           </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </div>
    </div>
  );
}
