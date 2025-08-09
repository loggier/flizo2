
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
  Image as ImageIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAddress } from "@/services/flizo.service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { SensorIcon } from "./sensor-icon";
import { FootstepsIcon } from "../icons/footsteps-icon";


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

const InfoRow = ({ icon: Icon, label, value, isAddress = false }: { icon: React.ElementType, label: string, value: string | React.ReactNode, isAddress?: boolean }) => (
    <div className="flex items-start gap-3 text-xs">
        <Icon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-gray-600">
            <span className="font-bold text-gray-700">{label}: </span>
            <span className={cn(isAddress ? "h-8 line-clamp-2" : "")}>{value}</span>
        </div>
    </div>
);


export default function VehicleDetailsSheet({ device, onClose }: VehicleDetailsSheetProps) {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const [address, setAddress] = useState('Ubicación no disponible');
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  
  useEffect(() => {
    let isMounted = true;
    
    if (device) {
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
      } else if (device.address) {
        setAddress(device.address);
      } else {
        setAddress('Ubicación no disponible');
      }
    }

    return () => { isMounted = false; };
  }, [device]);

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap())
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])


  if (!device) return null;

  const status = getStatusInfo(device);
  const deviceIconUrl = device.icon ? `${serverUrl}${device.icon.path}` : `https://placehold.co/80x80.png`;
  const deviceImageUrl = device.image ? `${serverUrl}${device.image}` : null;
  const hasSensors = device.sensors && device.sensors.length > 0;
  const hasImage = !!deviceImageUrl;

  const totalDistance = `${device.device_data.total_distance.toFixed(2)} ${device.unit_of_distance}`;


  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none mb-3">
       <div className="bg-background rounded-xl shadow-2xl overflow-hidden pointer-events-auto max-w-lg mx-auto p-2">

        <div className="p-3 relative bg-white rounded-t-lg">
            <Button size="icon" variant="ghost" onClick={onClose} className="absolute top-2 right-2 rounded-full bg-black/10 hover:bg-black/20 h-8 w-8 text-gray-700 z-10">
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
                    <h2 className="font-bold text-lg text-gray-800 truncate pr-8">{device.name}</h2>
                    <p className="text-3xl font-bold text-primary">{device.speed} <span className="text-base font-medium text-gray-500">{device.distance_unit_hour}</span></p>
                </div>
            </div>

            {hasImage && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="absolute top-2 left-2 h-8">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Ver Imagen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 border-0 max-w-md">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Imagen del vehículo: {device.name}</DialogTitle>
                        </DialogHeader>
                        <Image
                            src={deviceImageUrl!}
                            alt={`Imagen de ${device.name}`}
                            width={1024}
                            height={768}
                            className="w-full h-auto rounded-lg object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}

            <div className="mt-3 flex items-center justify-between border-t pt-2">
                 <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full text-white", status.colorClass)}>
                    {status.icon}
                    <span>{status.text}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><History className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><FileText className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Send className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Share2 className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Compass className="h-4 w-4 text-gray-600" /></Button>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-200 h-8 w-8"><Star className="h-4 w-4 text-gray-600" /></Button>
                </div>
            </div>
        </div>
        
        <div className="bg-gray-50 rounded-b-lg">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              <CarouselItem>
                <div className="p-3 space-y-2">
                    <h3 className="font-bold text-sm mb-2 text-gray-800 px-1">INFORMACIÓN</h3>
                    <div className="space-y-3 p-3 bg-white rounded-lg">
                      <InfoRow icon={MapPin} label="Ubicación" value={address} isAddress={true} />
                      <InfoRow icon={Clock} label="Última Conexión" value={new Date(device.timestamp * 1000).toLocaleString()} />
                      <InfoRow icon={Signal} label="Hace" value={formatTimeAgo(device.timestamp)} />
                      <InfoRow icon={Timer} label="Parado desde" value={device.stop_duration} />
                      <InfoRow icon={Compass} label="Ángulo" value={`${device.course}°`} />
                      <InfoRow icon={FootstepsIcon} label="Distancia Total" value={totalDistance} />
                    </div>
                </div>
              </CarouselItem>
              {hasSensors && (
                <CarouselItem>
                  <div className="p-3 space-y-2">
                      <h3 className="font-bold text-sm mb-2 text-gray-800 px-1">SENSORES</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {device.sensors.map((sensor: Sensor) => (
                           <div key={sensor.id} className="bg-white rounded-lg p-2 flex flex-col items-center justify-center text-center space-y-1 h-24">
                            <SensorIcon sensor={sensor} className="h-6 w-6 text-primary" />
                            <div className="text-xs text-gray-600 line-clamp-1" dangerouslySetInnerHTML={{ __html: sensor.name }} />
                            <div className="text-sm font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: sensor.value }} />
                          </div>
                        ))}
                      </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
          {hasSensors && (
            <div className="flex justify-center gap-2 py-2">
              {[...Array(2)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    i === current ? "w-4 bg-primary" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
