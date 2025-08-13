
"use client";

import { useState, useEffect } from 'react';
import type { AlertEvent } from "@/lib/types";
import { getAddress } from "@/services/flizo.service";
import { Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface AlertCardProps {
  event: AlertEvent;
}

export function AlertCard({ event }: AlertCardProps) {
  const [address, setAddress] = useState(event.address || 'Cargando dirección...');

  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      if (!event.address && event.latitude && event.longitude) {
        try {
          const fetchedAddress = await getAddress(event.latitude, event.longitude);
          if (isMounted) {
            setAddress(fetchedAddress || 'Dirección no disponible');
          }
        } catch (error) {
          if (isMounted) {
            setAddress('No se pudo obtener la dirección');
          }
          console.error("Error fetching address:", error);
        }
      } else if(event.address) {
        setAddress(event.address);
      } else {
        setAddress('Dirección no disponible');
      }
    };
    
    fetchAddress();

    return () => { isMounted = false; };
  }, [event.latitude, event.longitude, event.address]);

  const handleViewClick = () => {
    sessionStorage.setItem('selectedDeviceId', event.device_id.toString());
    // Potentially also store lat/lng to focus map
    window.location.href = `/maps?lat=${event.latitude}&lng=${event.longitude}`;
  };

  const [date, time] = event.time.split(' ');

  return (
    <div className="bg-white rounded-xl shadow-md p-3 overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="text-center flex-shrink-0 w-20">
          <p className="text-sm font-semibold text-destructive">{date}</p>
          <p className="text-sm text-destructive">{time}</p>
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-sm text-gray-800">{event.device_name}</h3>
          <p className="text-sm text-destructive">{event.message}</p>
          <p className="text-xs text-gray-500 h-8 line-clamp-2">{address}</p>
        </div>

        <div className="flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={handleViewClick} className="text-destructive hover:bg-destructive/10 rounded-full">
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
