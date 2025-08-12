
"use client";

import type { Route } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import { RouteIcon } from "../icons/route-icon";

interface RouteListItemProps {
  route: Route;
  isVisible: boolean;
  onVisibilityChange: (id: number, visible: boolean) => void;
  onSelect: (route: Route) => void;
}

export default function RouteListItem({ route, isVisible, onVisibilityChange, onSelect }: RouteListItemProps) {
    const distanceInKm = (route.coordinates.reduce((acc, _, i, arr) => {
        if (i === 0) return acc;
        const p1 = arr[i - 1];
        const p2 = arr[i];
        const R = 6371; // Radius of the earth in km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lng - p1.lng) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return acc + d;
    }, 0)).toFixed(2);

    return (
        <div className="relative p-4 pr-4 border-b border-gray-200 cursor-pointer" onClick={() => onSelect(route)}>
            <div className="flex items-center gap-3">
                 <div onClick={(e) => e.stopPropagation()} className="pr-2">
                    <Checkbox 
                        id={`route-vis-${route.id}`}
                        checked={isVisible}
                        onCheckedChange={(checked) => onVisibilityChange(route.id, !!checked)}
                    />
                 </div>
                 <RouteIcon className="h-6 w-6 text-gray-500 flex-shrink-0" style={{ color: route.color }} />
                 <div className="flex-1">
                    <p className="font-semibold text-gray-800">{route.name}</p>
                    <p className="text-sm text-primary">{distanceInKm} Km</p>
                 </div>
            </div>
        </div>
    )
}
