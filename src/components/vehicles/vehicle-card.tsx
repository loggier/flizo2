
"use client";

import Image from "next/image";
import { useState, useEffect } from 'react';
import type { Device, Sensor } from "@/lib/types";
import { cn, formatTimeAgo } from "@/lib/utils";
import { getAddress } from "@/services/flizo.service";
import { Clock } from "lucide-react";
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
    <div>
      <div className={cn("rounded-xl shadow-md overflow-hidden relative z-10", bgColor, textColor)}>
        <div className="p-3">
          <h3 className="font-bold text-sm mb-2">{device.name}</h3>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Image
                src={deviceIconUrl}
                alt={device.name}
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Conexión: {new Date(device.timestamp * 1000).toLocaleString()}</span>
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
        </div>
      </div>
      
      {hasSensors && (
        <div className="bg-white p-2 rounded-b-xl shadow-md relative -mt-1 pt-3 w-[95%] mx-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {device.sensors.map((sensor: Sensor, index: number) => (
              <div key={index} className="text-xs text-gray-700">
                <span 
                  className="font-bold"
                  dangerouslySetInnerHTML={{ __html: sensor.name + ':' }}
                />
                {' '}
                <span 
                  dangerouslySetInnerHTML={{ __html: sensor.value }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
