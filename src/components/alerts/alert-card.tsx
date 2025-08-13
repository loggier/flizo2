
"use client";

import { useState, useEffect } from 'react';
import type { AlertEvent } from "@/lib/types";
import { getAddress } from "@/services/flizo.service";
import { Eye } from 'lucide-react';
import { Button } from '../ui/button';

interface AlertCardProps {
  event: AlertEvent;
  onSelect: (event: AlertEvent) => void;
}

export function AlertCard({ event, onSelect }: AlertCardProps) {
  const [address, setAddress] = useState(event.address || 'Cargando dirección...');

  useEffect(() => {
    let isMounted = true;
    const fetchAddress = async () => {
      if (!event.address && event.latitude && event.longitude) {
        try {
          const fetchedAddress = await getAddress(event.latitude, event.longitude);
          if (isMounted) {
            setAddress(fetchedAddress || 'Dirección no disponible');
            event.address = fetchedAddress; // Update event object for map info window
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
  }, [event]);

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(event);
  };

  const [date, time] = event.time.split(' ');

  return (
    <div className="bg-white rounded-xl shadow-md p-3 overflow-hidden cursor-pointer" onClick={() => onSelect(event)}>
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-sm text-gray-800 truncate pr-2">{event.device_name}</h3>
            <div className="text-center flex-shrink-0">
              <p className="text-xs font-semibold text-gray-600">{date} {time}</p>
            </div>
          </div>
          <p className="text-sm text-destructive font-medium">{event.message}</p>
          <p className="text-xs text-gray-500 h-8 line-clamp-2">{address}</p>
        </div>

        <div className="flex-shrink-0 self-center">
          <Button variant="ghost" size="icon" onClick={handleViewClick} className="text-destructive hover:bg-destructive/10 rounded-full">
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
