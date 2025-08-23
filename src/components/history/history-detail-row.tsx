
"use client";

import type { HistoryItem } from "@/lib/types";

interface HistoryDetailRowProps {
    group: HistoryItem;
    getStatusText: (status: number) => string;
}

export default function HistoryDetailRow({ group, getStatusText }: HistoryDetailRowProps) {
    const point = group.items?.[0];
    const address = point?.address || 'Obteniendo dirección...';
    
    // Fallback for raw_time if it's missing, use the time from the first item
    const dateTimeToDisplay = group.raw_time || point?.time || " ";
    const [date, time] = (dateTimeToDisplay).split(" ");

    return (
        <div className="grid grid-cols-[auto,1fr,1fr,2fr] items-start gap-x-2 text-xs py-2 border-b last:border-b-0">
             <div className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded-sm font-mono font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            <div className="text-gray-800 font-semibold">
              <p>{date}</p>
              <p>{time}</p>
            </div>

            <div className="text-gray-600 font-medium">
                { (group.status === 1 || group.status === 2 || group.status === 3 || group.status === 4) && (
                    <p className="text-primary">{group.time}</p>
                )}
                 { group.status === 5 && (
                    <p>{point?.message}</p>
                )}
            </div>

            <div className="text-gray-600 break-words">
              {address}
            </div>
        </div>
    );
}
