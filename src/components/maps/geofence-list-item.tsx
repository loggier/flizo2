
"use client";

import type { Geofence } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import { GeofenceIcon } from "../icons/geofence-icon";
import { useEffect, useState } from "react";

interface GeofenceListItemProps {
  geofence: Geofence;
  isVisible: boolean;
  onVisibilityChange: (id: number, visible: boolean) => void;
}

function calculatePolygonArea(coordinates: { lat: number; lng: number }[]): number {
    if (coordinates.length < 3) {
      return 0;
    }
  
    const R = 6378.137; // Radio de la Tierra en km
    let area = 0;
  
    for (let i = 0; i < coordinates.length; i++) {
      const p1 = coordinates[i];
      const p2 = coordinates[(i + 1) % coordinates.length];
  
      area += (p2.lng - p1.lng) * (2 + Math.sin(p1.lat * Math.PI / 180) + Math.sin(p2.lat * Math.PI / 180));
    }
  
    area = area * R * R / 2;
    return Math.abs(area);
}
  

export default function GeofenceListItem({ geofence, isVisible, onVisibilityChange }: GeofenceListItemProps) {
    const [area, setArea] = useState<string>("Calculando...");

    useEffect(() => {
        let calculatedArea = 0;
        if (geofence.type === 'circle' && geofence.radius) {
            calculatedArea = Math.PI * Math.pow(geofence.radius / 1000, 2);
        } else if (geofence.type === 'polygon' && geofence.coordinates) {
            try {
                const coords = JSON.parse(geofence.coordinates);
                calculatedArea = calculatePolygonArea(coords);
            } catch (e) {
                console.error("Error parsing coordinates", e);
            }
        }

        setArea(`${calculatedArea.toFixed(3)} Km²`);
    }, [geofence]);

    return (
        <div className="relative p-4 pr-16 border-b border-gray-200">
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Checkbox 
                    id={`geofence-vis-${geofence.id}`}
                    checked={isVisible}
                    onCheckedChange={(checked) => onVisibilityChange(geofence.id, !!checked)}
                />
            </div>
            
            <div className="flex items-center gap-3">
                 <GeofenceIcon className="h-6 w-6 text-gray-500" style={{ color: geofence.polygon_color }} />
                 <div>
                    <p className="font-semibold text-gray-800">{geofence.name}</p>
                    <p className="text-sm text-primary">{area}</p>
                 </div>
            </div>
        </div>
    )
}
