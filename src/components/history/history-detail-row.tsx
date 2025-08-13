
"use client";

import { useState, useEffect } from "react";
import type { HistoryItem } from "@/lib/types";
import { getAddress } from "@/services/flizo.service";

interface HistoryDetailRowProps {
    group: HistoryItem;
    getStatusText: (status: number) => string;
}

export default function HistoryDetailRow({ group, getStatusText }: HistoryDetailRowProps) {
    const [address, setAddress] = useState("Obteniendo dirección...");
    
    useEffect(() => {
        let isMounted = true;
        const fetchAddress = async () => {
            const point = group.items[0];
            if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
                try {
                    const fetchedAddress = await getAddress(point.lat, point.lng);
                    if (isMounted) {
                        setAddress(fetchedAddress || "Dirección no disponible");
                    }
                } catch (error) {
                    if (isMounted) {
                        setAddress("No se pudo obtener la dirección");
                    }
                    console.error("Error fetching address for history item:", error);
                }
            } else {
                if (isMounted) {
                    setAddress("Coordenadas no válidas");
                }
            }
        };

        fetchAddress();

        return () => {
            isMounted = false;
        };
    }, [group]);
    
    const timeToDisplay = (group.status === 2 || group.status === 3 || group.status === 4) ? group.raw_time : (group.items[0]?.time || group.raw_time);
    const [date, time] = (timeToDisplay || " ").split(" ");

    return (
        <div className="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_2fr)] items-start gap-x-3 text-sm py-2 border-b last:border-b-0">
             <div className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded-sm font-mono text-xs font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            <div className="font-semibold text-gray-800">
              <p>{time}</p>
              {group.status === 2 && ( // Only for stops
                <p className="font-normal text-primary text-xs">{group.time}</p>
              )}
            </div>

            <div className="text-gray-600 break-words">
              {group.status === 5 ? (
                <>
                  <p className="font-semibold">{group.items[0]?.message || 'Evento'}</p>
                  <p>{address}</p>
                </>
              ) : (
                address
              )}
            </div>
        </div>
    );
}
