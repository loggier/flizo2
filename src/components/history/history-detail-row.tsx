
"use client";

import type { HistoryItem } from "@/lib/types";

interface HistoryDetailRowProps {
    group: HistoryItem;
    getStatusText: (status: number) => string;
}

export default function HistoryDetailRow({ group, getStatusText }: HistoryDetailRowProps) {
    // For events, the data is on the group object itself.
    // For other history items, the primary data point is the first in the items array.
    const point = (group.status === 5) ? group as any : group.items?.[0];

    if (!point) return null;

    const address = point.address || 'Obteniendo dirección...';
    
    // For events (status 5), we use its own time. For other groups, use the group's time.
    const dateTimeToDisplay = point.time || group.time || " ";
    const [date, time] = (dateTimeToDisplay).split(" ");

    return (
        <div className="grid grid-cols-[auto,1fr,1fr,1fr] items-start gap-x-3 text-xs py-2 px-1 border-b last:border-b-0">
            {/* Column 1: Status Icon */}
            <div className="flex items-center justify-center w-5 h-5 bg-gray-200 text-gray-700 rounded-sm font-mono font-bold mt-1">
                {getStatusText(group.status)}
            </div>
            
            {/* Column 2: Date & Time or Event Time */}
            <div className="text-gray-800 font-semibold space-y-0.5">
                {(group.status === 2 || group.status === 5) && (
                    <>
                        <p>{date}</p>
                        <p>{time}</p>
                    </>
                )}
                 {(group.status === 1 || group.status === 3 || group.status === 4) && (
                     <p>{group.raw_time}</p>
                 )}
            </div>

            {/* Column 3: Duration or Event Message */}
            <div className="text-gray-600 font-medium break-words">
                 {(group.status === 1 || group.status === 3 || group.status === 4 || group.status === 2) && (
                    <p className={group.status === 2 ? "text-primary font-bold" : ""}>{group.time}</p>
                 )}
                 {group.status === 5 && (
                    <p>{point?.message}</p>
                 )}
            </div>

            {/* Column 4: Address */}
            <div className="text-gray-600 break-words">
              {address}
            </div>
        </div>
    );
}
