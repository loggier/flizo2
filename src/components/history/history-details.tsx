
"use client";

import { HistoryData, Device } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeedIcon } from "../icons/speed-icon";
import { DistanceIcon } from "../icons/distance-icon";
import { EngineIdleIcon } from "../icons/engine-idle-icon";

interface HistoryDetailsProps {
  history: HistoryData;
  device: Device;
  onClose: () => void;
}

const SummaryItem = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string, label: string }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    </div>
);

export default function HistoryDetails({ history, device, onClose }: HistoryDetailsProps) {

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'D'; // Drive
      case 2: return 'P'; // Stop
      case 3: return 'I'; // Idle?
      case 4: return 'F'; // End?
      case 5: return 'E'; // Event
      default: return '?';
    }
  };

  const events = history.items.filter(item => item.status === 5);

  return (
    <Card className="rounded-t-2xl shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{device.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resume">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
                <SummaryItem icon={SpeedIcon} value={history.top_speed} label="Vel. Máxima" />
                <SummaryItem icon={DistanceIcon} value={history.distance_sum} label="Distancia" />
                <SummaryItem icon={EngineIdleIcon} value={history.engine_idle} label="Ralentí" />
                <SummaryItem icon={EngineIdleIcon} value={history.move_duration} label="En movimiento" />
            </div>
          </TabsContent>
          <TabsContent value="details">
            <ScrollArea className="h-48">
              <div className="space-y-2 text-xs">
                {history.items.flatMap(group => group.items).map((item, index) => (
                   <div key={index} className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
                        <span className="font-mono bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-sm">{getStatusText(item.status)}</span>
                        <span className="font-semibold">{item.time}</span>
                        <span className="text-gray-600 truncate">{item.address || "Obteniendo dirección..."}</span>
                   </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="events">
            <ScrollArea className="h-48">
              <div className="space-y-2 text-xs">
                {events.flatMap(group => group.items).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100">
                      <span className="font-mono bg-red-200 text-red-800 px-1.5 py-0.5 rounded-sm">{getStatusText(item.status)}</span>
                      <span className="font-semibold">{item.time}</span>
                      <span className="text-gray-600 truncate">{item.message || "Evento"}</span>
                  </div>
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
