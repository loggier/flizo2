
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import type { Device, DeviceGroup, Geofence, GeofenceGroup } from "@/lib/types";
import DeviceListItem from "./device-list-item";
import { ScrollArea } from "../ui/scroll-area";
import { DeviceListSkeleton } from "./device-list-skeleton";
import GeofenceListItem from "./geofence-list-item";

interface DeviceListSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deviceGroups: DeviceGroup[];
  visibleDeviceIds: Set<number>;
  toggleDeviceVisibility: (deviceIds: number | number[], visible: boolean) => void;
  onSelectDevice: (device: Device) => void;
  geofences: Geofence[];
  visibleGeofenceIds: Set<number>;
  toggleGeofenceVisibility: (geofenceIds: number | number[], visible: boolean) => void;
  onSelectGeofence: (geofence: Geofence) => void;
  isLoading: boolean;
}

export default function DeviceListSheet({
  isOpen,
  onOpenChange,
  deviceGroups,
  visibleDeviceIds,
  toggleDeviceVisibility,
  onSelectDevice,
  geofences,
  visibleGeofenceIds,
  toggleGeofenceVisibility,
  onSelectGeofence,
  isLoading,
}: DeviceListSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const geofenceGroups = useMemo(() => {
    const groups: { [key: string]: GeofenceGroup } = {};
    const filteredGeofences = geofences.filter(geofence => 
      geofence.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredGeofences.forEach(geofence => {
      const groupId = geofence.group_id || 0;
      if (!groups[groupId]) {
        const groupTitle = deviceGroups.find(dg => dg.id === groupId)?.title || (groupId === 0 ? "Sin grupo" : `Grupo ${groupId}`);
        groups[groupId] = { id: groupId, title: groupTitle, geofences: [] };
      }
      groups[groupId].geofences.push(geofence);
    });

    return Object.values(groups);
  }, [geofences, deviceGroups, searchTerm]);


  const filteredDeviceGroups = deviceGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const handleGroupCheckChange = (group: DeviceGroup, checked: boolean) => {
    const deviceIds = group.items.map(d => d.id);
    toggleDeviceVisibility(deviceIds, checked);
  };

  const handleGeofenceGroupCheckChange = (group: GeofenceGroup, checked: boolean) => {
    const geofenceIds = group.geofences.map(g => g.id);
    toggleGeofenceVisibility(geofenceIds, checked);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 !w-[90vw] sm:!w-[400px] flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Lista</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="dispositivos" className="w-full flex flex-col flex-1 min-h-0">
          <div className="bg-primary p-2">
              <TabsList className="grid w-full grid-cols-3 bg-primary-foreground/20">
                  <TabsTrigger value="dispositivos" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Dispositivos</TabsTrigger>
                  <TabsTrigger value="geozonas" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Geozonas</TabsTrigger>
                  <TabsTrigger value="poi" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">POI</TabsTrigger>
              </TabsList>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full rounded-md bg-white text-black pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>

          <ScrollArea className="flex-1 bg-white text-black">
              <TabsContent value="dispositivos" className="m-0">
                {isLoading ? (
                  <DeviceListSkeleton />
                ) : (
                  <Accordion type="multiple" defaultValue={filteredDeviceGroups.map(g => g.id.toString())} className="w-full">
                    {filteredDeviceGroups.map((group) => {
                      const allItemsInGroupVisible = group.items.every(item => visibleDeviceIds.has(item.id));
                      const someItemsInGroupVisible = group.items.some(item => visibleDeviceIds.has(item.id));
                      
                      return (
                      <AccordionItem value={group.id.toString()} key={group.id} className="border-b">
                        <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                            <div className="flex items-center flex-1">
                                <div onClick={(e) => e.stopPropagation()} className="pr-2">
                                    <Checkbox 
                                        id={`group-${group.id}`}
                                        checked={allItemsInGroupVisible ? true : (someItemsInGroupVisible ? 'indeterminate' : false)}
                                        onCheckedChange={(checked) => handleGroupCheckChange(group, !!checked)}
                                      />
                                </div>
                                <AccordionTrigger className="p-0 flex-1">
                                    <label htmlFor={`group-${group.id}`} className="font-semibold cursor-pointer">{group.title}</label>
                                </AccordionTrigger>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                    {group.items.length}
                                </span>
                            </div>
                        </div>
                        <AccordionContent>
                          <div className="flex flex-col">
                            {group.items.map((device) => (
                              <DeviceListItem 
                                key={device.id} 
                                device={device}
                                isVisible={visibleDeviceIds.has(device.id)}
                                onVisibilityChange={toggleDeviceVisibility}
                                onSelect={onSelectDevice}
                              />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )})}
                  </Accordion>
                )}
              </TabsContent>
              <TabsContent value="geozonas" className="m-0">
                  {isLoading ? (
                      <DeviceListSkeleton />
                  ) : (
                      <Accordion type="multiple" defaultValue={geofenceGroups.map(g => g.id.toString())} className="w-full">
                      {geofenceGroups.map((group) => {
                          const allGeofencesInGroupVisible = group.geofences.every(item => visibleGeofenceIds.has(item.id));
                          const someGeofencesInGroupVisible = group.geofences.some(item => visibleGeofenceIds.has(item.id));

                          return (
                          <AccordionItem value={group.id.toString()} key={`geofence-group-${group.id}`} className="border-b">
                              <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                                  <div className="flex items-center flex-1">
                                      <div onClick={(e) => e.stopPropagation()} className="pr-2">
                                          <Checkbox 
                                              id={`geofence-group-${group.id}`}
                                              checked={allGeofencesInGroupVisible ? true : (someGeofencesInGroupVisible ? 'indeterminate' : false)}
                                              onCheckedChange={(checked) => handleGeofenceGroupCheckChange(group, !!checked)}
                                          />
                                      </div>
                                      <AccordionTrigger className="p-0 flex-1">
                                          <label htmlFor={`geofence-group-${group.id}`} className="font-semibold cursor-pointer">{group.title}</label>
                                      </AccordionTrigger>
                                  </div>
                                  <div className="flex items-center gap-2">
                                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                      {group.geofences.length}
                                  </span>
                                  </div>
                              </div>
                              <AccordionContent>
                                  <div className="flex flex-col">
                                      {group.geofences.map((geofence) => (
                                          <GeofenceListItem
                                              key={geofence.id}
                                              geofence={geofence}
                                              isVisible={visibleGeofenceIds.has(geofence.id)}
                                              onVisibilityChange={toggleGeofenceVisibility}
                                              onSelect={onSelectGeofence}
                                          />
                                      ))}
                                  </div>
                              </AccordionContent>
                          </AccordionItem>
                          )
                      })}
                      </Accordion>
                  )}
              </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
