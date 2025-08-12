
"use client";

import type { POI } from "@/lib/types";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";

interface PoiListItemProps {
  poi: POI;
  isVisible: boolean;
  onVisibilityChange: (id: number, visible: boolean) => void;
  onSelect: (poi: POI) => void;
}

export default function PoiListItem({ poi, isVisible, onVisibilityChange, onSelect }: PoiListItemProps) {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const iconUrl = poi.map_icon.url.startsWith('http') ? poi.map_icon.url : `${serverUrl}${poi.map_icon.path}`;
    
  return (
    <div className="relative p-4 pr-4 border-b border-gray-200 cursor-pointer" onClick={() => onSelect(poi)}>
        <div className="flex items-center gap-3">
             <div onClick={(e) => e.stopPropagation()} className="pr-2">
                <Checkbox 
                    id={`poi-vis-${poi.id}`}
                    checked={isVisible}
                    onCheckedChange={(checked) => onVisibilityChange(poi.id, !!checked)}
                />
             </div>
             <Image 
                src={iconUrl}
                alt={poi.name}
                width={poi.map_icon.width || 32}
                height={poi.map_icon.height || 32}
                className="flex-shrink-0"
             />
             <div className="flex-1">
                <p className="font-semibold text-gray-800">{poi.name}</p>
                <p className="text-sm text-gray-500 truncate">{poi.description}</p>
             </div>
        </div>
    </div>
  )
}
