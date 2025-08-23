
"use client";

import type { HistoryItem, HistoryPoint } from "@/lib/types";

interface HistoryDetailRowProps {
    group: HistoryItem;
    getStatusText: (status: number) => string;
    onSelect: (point: HistoryPoint) => void;
}

export default function HistoryDetailRow({ group, getStatusText, onSelect }: HistoryDetailRowProps) {
    const point: HistoryPoint | undefined = group.items[0];
    if (!point) return null;
    
    const address = point.address || 'Obteniendo dirección...';
    
    const timeToDisplay = point.time || group.raw_time || " ";
    const [date, time] = (timeToDisplay).split(" ");

    return (
        <div 
            className="grid grid-cols-[auto,1.2fr,1.5fr,1.5fr] items-start gap-x-3 text-xs py-2 px-1 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
            onClick={() => onSelect(point)}
        >
            {/* Column 1: Status Icon */}
            <div className="flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-700 rounded-sm font-mono font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            {/* Column 2: Date / Time or Message */}
            <div className="text-gray-800 font-semibold space-y-0.5 break-words self-center">
                 <p>{date}</p>
                 <p>{time}</p>
                 {group.status === 2 && ( // Stop, show duration below time
                    <p className="text-primary font-bold">{group.time}</p>
                 )}
                 {(group.status === 1 || group.status === 3 || group.status === 4) && (
                    <p>{group.time}</p> // Drive, Idle, End -> Duration
                 )}
            </div>

            {/* Column 3: Duration or Event Message */}
            <div className="text-gray-600 font-medium break-words self-center">
                {group.status === 5 ? (
                    <p>{(group as any).message}</p>
                ) : address }
            </div>

            {/* Column 4: Address */}
            <div className="text-gray-600 break-words self-center">
              {group.status !== 5 ? "" : address}
            </div>
        </div>
    );
}
