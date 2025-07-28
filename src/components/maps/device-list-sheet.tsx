
"use client";

import { useState } from "react";
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
import type { DeviceGroup } from "@/lib/types";
import DeviceListItem from "./device-list-item";
import { ScrollArea } from "../ui/scroll-area";

interface DeviceListSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  deviceGroups: DeviceGroup[];
  visibleDeviceIds: Set<number>;
  toggleDeviceVisibility: (deviceIds: number | number[], visible: boolean) => void;
}

export default function DeviceListSheet({
  isOpen,
  onOpenChange,
  deviceGroups,
  visibleDeviceIds,
  toggleDeviceVisibility
}: DeviceListSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = deviceGroups
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 !w-[90vw] sm:!w-[400px] flex flex-col bg-primary text-primary-foreground [&>button]:hidden"
      >
        <SheetHeader className="p-4 bg-primary">
          <SheetTitle className="text-white">Vehículos</SheetTitle>
        </SheetHeader>
        <div className="bg-primary p-2">
            <Tabs defaultValue="dispositivos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-primary-foreground/20">
                <TabsTrigger value="dispositivos" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Dispositivos</TabsTrigger>
                <TabsTrigger value="geozonas" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Geozonas</TabsTrigger>
                <TabsTrigger value="poi" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">POI</TabsTrigger>
            </TabsList>
            <TabsContent value="dispositivos" className="mt-2">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    placeholder="Buscar Vehículos..."
                    className="w-full rounded-md bg-white text-black pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
            </TabsContent>
            </Tabs>
        </div>
        <ScrollArea className="flex-1 bg-white text-black">
          <Accordion type="multiple" defaultValue={filteredGroups.map(g => g.id.toString())} className="w-full">
            {filteredGroups.map((group) => {
              const allItemsInGroupVisible = group.items.every(item => visibleDeviceIds.has(item.id));
              const someItemsInGroupVisible = group.items.some(item => visibleDeviceIds.has(item.id));
              
              return (
              <AccordionItem value={group.id.toString()} key={group.id} className="border-b">
                <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                    <div className="flex items-center">
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
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
