
"use client";

import { HistoryData, Device, HistoryPoint } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SpeedIcon } from "../icons/speed-icon";
import { DistanceIcon } from "../icons/distance-icon";
import { EngineIdleIcon } from "../icons/engine-idle-icon";
import HistoryDetailRow from "./history-detail-row";
import { ScrollArea } from "../ui/scroll-area";

interface HistoryDetailsProps {
  history: HistoryData;
  device: Device;
  onClose: () => void;
  onPointSelect: (point: HistoryPoint) => void;
}

const SummaryItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-2 bg-gray-50 rounded-lg">
        <Icon className="h-8 w-8 text-primary mb-2" />
        <p className="text-lg font-bold text-gray-800">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
);

export default function HistoryDetails({ history, device, onClose, onPointSelect }: HistoryDetailsProps) {

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'D'; // Drive
      case 2: return 'P'; // Stop
      case 3: return 'I'; // Idle
      case 4: return 'F'; // End
      case 5: return 'E'; // Event
      default: return '?';
    }
  };

  const events = history.items.filter(item => item.status === 5);
  const details = history.items.filter(item => item.status !== 5);

  return (
    <Card className="rounded-t-2xl shadow-lg h-full flex flex-col">
      <CardHeader className="py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{device.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2 min-h-0 overflow-y-auto">
        <Tabs defaultValue="details" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resume">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>
          
            <TabsContent value="resume" className="pt-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                  <SummaryItem icon={SpeedIcon} value={history.top_speed} label="Vel. Máxima" />
                  <SummaryItem icon={DistanceIcon} value={history.distance_sum} label="Distancia" />
                  <SummaryItem icon={EngineIdleIcon} value={history.stop_duration} label="Motor inactivo" />
                  <SummaryItem icon={EngineIdleIcon} value={history.move_duration} label="En movimiento" />
              </div>
            </TabsContent>

            <TabsContent value="details" className="flex-1 min-h-0 mt-2">
                <ScrollArea className="h-full">
                    <div className="space-y-1 text-xs pr-2">
                        {details.map((group, groupIndex) => (
                        <HistoryDetailRow key={groupIndex} group={group} getStatusText={getStatusText} onSelect={onPointSelect}/>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="flex-1 min-h-0 mt-2">
                 <ScrollArea className="h-full">
                    <div className="space-y-1 text-xs pr-2">
                        {events.map((group, groupIndex) => (
                        <HistoryDetailRow key={`event-${groupIndex}`} group={group} getStatusText={getStatusText} onSelect={onPointSelect} />
                        ))}
                        {events.length === 0 && <p className="text-center text-muted-foreground p-4">No hay eventos en este período.</p>}
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
