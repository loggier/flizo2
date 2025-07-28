
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Milestone,
  Send,
  Share2,
  Signal,
  Star,
  Timer,
  WifiOff,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAddress } from "@/services/flizo.service";

interface VehicleDetailsSheetProps {
  device: Device | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getStatusInfo = (device: Device): { text: string; color: string; icon: React.ReactNode } => {
    switch (device.online) {
      case 'moving':
        return { text: 'En movimiento', color: 'bg-green-500', icon: <Car className="h-4 w-4" /> };
      case 'online':
        return { text: 'Detenido', color: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'engine':
        return { text: 'Motor Encendido', color: 'bg-yellow-500', icon: <Zap className="h-4 w-4" /> };
      case 'stopped':
        return { text: 'Detenido', color: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'ack':
        return { text: 'Detenido', color: 'bg-yellow-500', icon: <Car className="h-4 w-4" /> };
      case 'offline':
        return { text: 'No conectado', color: 'bg-red-500', icon: <WifiOff className="h-4 w-4" /> };
      default:
        return { text: 'Desconocido', color: 'bg-gray-500', icon: <Car className="h-4 w-4" /> };
    }
};

const InfoRow = ({ icon: Icon, value }: { icon: React.ElementType, value: string | React.ReactNode }) => (
    <div className="flex items-center gap-3 text-sm">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="text-gray-600 flex-1">{value}</div>
    </div>
);

export default function VehicleDetailsSheet({ device, isOpen, onOpenChange }: VehicleDetailsSheetProps) {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const [address, setAddress] = useState('Ubicación no disponible');
  
  useEffect(() => {
    let isMounted = true;
    
    if (device) {
        setAddress(device.address || 'Cargando dirección...');

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
        } else {
             setAddress('Ubicación no disponible');
        }
    }

    return () => { isMounted = false; };
  }, [device?.lat, device?.lng, device?.address, device]);


  if (!device) return null;

  const status = getStatusInfo(device);
  const deviceIconUrl = device.icon ? `${serverUrl}${device.icon.path}` : `https://placehold.co/80x80.png`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-2xl p-0 bg-gray-100 h-[50vh] flex flex-col"
        withHandle
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{device.name}</SheetTitle>
        </SheetHeader>
        <div className={cn("flex items-center p-4 text-white rounded-t-2xl", status.color)}>
            <Image
                src={deviceIconUrl}
                alt={device.name}
                width={56}
                height={56}
                className="w-14 h-14 object-contain bg-white/20 rounded-lg p-1"
            />
            <div className="ml-4 flex-1">
                <h2 className="font-bold text-lg">{device.name}</h2>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    {status.icon}
                    <span>{status.text}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30"><Send className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30"><Share2 className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30"><Compass className="h-5 w-5" /></Button>
                <Button size="icon" variant="ghost" className="rounded-full bg-white/20 hover:bg-white/30"><Star className="h-5 w-5" /></Button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-base mb-4 text-gray-800">INFORMACIÓN</h3>
                <div className="space-y-4">
                    <InfoRow icon={MapPin} value={address} />
                    <InfoRow icon={Clock} value={new Date(device.timestamp * 1000).toLocaleString()} />
                    <InfoRow icon={Signal} value={formatTimeAgo(device.timestamp)} />
                    <InfoRow icon={Timer} value={device.stop_duration} />
                    <InfoRow icon={Milestone} value={`${device.total_distance.toFixed(2)} ${device.unit_of_distance}`} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button size="lg" variant="outline" className="bg-white"><History className="mr-2"/> Historial</Button>
                <Button size="lg" variant="outline" className="bg-white"><FileText className="mr-2"/> Reportes</Button>
            </div>

            {device.sensors && device.sensors.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {device.sensors.map((sensor: Sensor) => (
                           <div key={sensor.id} className="text-sm">
                                <span className="font-semibold text-gray-600" dangerouslySetInnerHTML={{ __html: sensor.name + ':' }} />
                                {' '}
                                <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: sensor.value }} />
                           </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

