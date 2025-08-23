
"use client";

import type { HistoryItem } from "@/lib/types";

interface HistoryDetailRowProps {
    group: HistoryItem;
    getStatusText: (status: number) => string;
}

export default function HistoryDetailRow({ group, getStatusText }: HistoryDetailRowProps) {
    const point = group.items[0];
    const address = point?.address || 'Obteniendo dirección...';
    
    // For events (status 5), the primary date is at the group level
    const timeToDisplay = group.status === 5 ? group.raw_time : point?.time || group.time || " ";
    const [date, time] = (timeToDisplay).split(" ");

    return (
        <div className="grid grid-cols-[auto,1fr,1.5fr,1.5fr] items-start gap-x-3 text-xs py-2 px-1 border-b last:border-b-0">
            {/* Column 1: Status Icon */}
            <div className="flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-700 rounded-sm font-mono font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            {/* Column 2: Date / Time */}
            <div className="text-gray-800 font-semibold space-y-0.5">
                <p>{date}</p>
                <p>{time}</p>
            </div>

            {/* Column 3: Duration or Event Message */}
            <div className="text-gray-600 font-medium break-words self-center">
                 {(group.status === 1 || group.status === 3 || group.status === 4) && (
                    <p>{group.time}</p> // Duration
                 )}
                 {group.status === 2 && ( // Stop
                    <p className="text-primary font-bold">{group.time}</p> // Duration
                 )}
                 {group.status === 5 && ( // Event
                    <p>{group.message}</p>
                 )}
            </div>

            {/* Column 4: Address */}
            <div className="text-gray-600 break-words self-center">
              {address}
            </div>
        </div>
    );
}
