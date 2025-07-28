
"use client";

import Image from "next/image";
import { useState, useEffect } from 'react';
import type { Device, Sensor } from "@/lib/types";
import { cn, formatTimeAgo } from "@/lib/utils";
import { getAddress } from "@/services/flizo.service";
import { KeySquare, Clock } from "lucide-react";
import { FootstepsIcon } from "../icons/footsteps-icon";
import { MapPinIcon } from "../icons/map-pin-icon";

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
  const [address, setAddress] = useState(device.address || 'Cargando dirección...');

  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      if (device.lat && device.lng) {
        try {
          const fetchedAddress = await getAddress(device.lat, device.lng);
          if (isMounted) {
            setAddress(fetchedAddress);
          }
        } catch (error) {
          if (isMounted) {
            setAddress('No se pudo obtener la dirección');
          }
          console.error("Error fetching address:", error);
        }
      } else {
        setAddress('Ubicación no disponible');
      }
    };

    fetchAddress();

    return () => {
      isMounted = false;
    };
  }, [device.lat, device.lng]);

  const hasSensors = device.sensors && device.sensors.length > 0;

  return (
    <div className={cn("rounded-xl shadow-md overflow-hidden", bgColor, textColor)}>
      <div className="flex items-start p-3 gap-3">
        <div className="flex-shrink-0 pt-1">
          <Image
            src={deviceIconUrl}
            alt={device.name}
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
          />
        </div>

        <div className="flex-1 space-y-1.5 text-xs">
          <h3 className="font-bold text-sm">{device.name}</h3>
          
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="leading-tight">{address}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Conexión: {new Date(device.timestamp * 1000).toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <FootstepsIcon className="w-4 h-4" />
            <span>Online: {formatTimeAgo(device.timestamp)}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-center">
          <p className="font-bold text-2xl">{device.speed}</p>
          <p className="text-xs">{device.distance_unit_hour}</p>
        </div>
      </div>
      
      {hasSensors && (
        <div className="bg-white/60 p-3 mt-2 border-t border-black/5">
          <h4 className="text-xs font-bold text-gray-600 mb-2">Sensores</h4>
          <div className="space-y-1.5">
            {device.sensors.map((sensor: Sensor, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-700">
                <span 
                  className="flex items-center gap-1.5"
                  dangerouslySetInnerHTML={{ __html: sensor.value }}
                />
                <span>{sensor.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
