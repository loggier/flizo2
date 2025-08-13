
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
    
    const timeToDisplay = group.raw_time || " ";
    const [date, time] = (timeToDisplay).split(" ");

    return (
        <div className="grid grid-cols-[auto_minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_2fr)] items-start gap-x-2 text-xs py-2 border-b last:border-b-0">
             <div className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded-sm font-mono font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            <div className="text-gray-800 font-semibold">
              <p>{date}</p>
              <p>{time}</p>
            </div>

            <div className="text-gray-600 font-medium">
                {(group.status === 1 || group.status === 2 || group.status === 3 || group.status === 4) && (
                    <p className="text-primary">{group.time}</p>
                )}
                {group.status === 5 && (
                    <p>{group.items[0]?.message}</p>
                )}
            </div>

            <div className="text-gray-600 break-words">
              {address}
            </div>
        </div>
    );
}

