
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

        if (group.status !== 5) { // No fetch address for events with message
            fetchAddress();
        } else {
            setAddress(group.items[0]?.message || 'Evento sin mensaje');
        }


        return () => {
            isMounted = false;
        };
    }, [group]);
    
    const [date, time] = (group.raw_time || " ").split(" ");

    return (
        <div className="grid grid-cols-[auto,1fr,2fr] items-start gap-x-3">
            <span className="font-mono bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-sm text-center">
                {getStatusText(group.status)}
            </span>
            
            <div className="font-semibold text-gray-700">
                {group.status === 2 ? (
                    <>
                      <div>{time}</div>
                      <div className="font-normal text-primary">{group.time}</div>
                    </>
                ) : (
                    <div>{time}</div>
                )}
            </div>

            <div className="text-gray-600 break-words">
              {address}
            </div>
        </div>
    );
}
