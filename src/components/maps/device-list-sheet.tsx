
"use client";

import { useState, useMemo } from "react";
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
import type { Device, DeviceGroup, Geofence, Route, POI } from "@/lib/types";
import DeviceListItem from "./device-list-item";
import { ScrollArea } from "../ui/scroll-area";
import { DeviceListSkeleton } from "./device-list-skeleton";
import GeofenceListItem from "./geofence-list-item";
import RouteListItem from "./route-list-item";
import PoiListItem from "./poi-list-item";

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
  routes: Route[];
  visibleRouteIds: Set<number>;
  toggleRouteVisibility: (routeIds: number | number[], visible: boolean) => void;
  onSelectRoute: (route: Route) => void;
  pois: POI[];
  visiblePoiIds: Set<number>;
  togglePoiVisibility: (poiIds: number | number[], visible: boolean) => void;
  onSelectPOI: (poi: POI) => void;
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
  routes,
  visibleRouteIds,
  toggleRouteVisibility,
  onSelectRoute,
  pois,
  visiblePoiIds,
  togglePoiVisibility,
  onSelectPOI,
  isLoading,
}: DeviceListSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredGeofences = useMemo(() => 
    geofences.filter(geofence => 
      geofence.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [geofences, searchTerm]);

  const filteredRoutes = useMemo(() =>
    routes.filter(route =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [routes, searchTerm]);

  const filteredPois = useMemo(() =>
    pois.filter(poi =>
      poi.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [pois, searchTerm]);

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

  const handleToggleAllGeofences = (checked: boolean) => {
    const geofenceIds = filteredGeofences.map(g => g.id);
    toggleGeofenceVisibility(geofenceIds, checked);
  };

  const handleToggleAllRoutes = (checked: boolean) => {
    const routeIds = filteredRoutes.map(r => r.id);
    toggleRouteVisibility(routeIds, checked);
  };

  const handleToggleAllPois = (checked: boolean) => {
    const poiIds = filteredPois.map(p => p.id);
    togglePoiVisibility(poiIds, checked);
  };

  const allFilteredGeofencesVisible = filteredGeofences.length > 0 && filteredGeofences.every(g => visibleGeofenceIds.has(g.id));
  const someFilteredGeofencesVisible = filteredGeofences.some(g => visibleGeofenceIds.has(g.id));

  const allFilteredRoutesVisible = filteredRoutes.length > 0 && filteredRoutes.every(r => visibleRouteIds.has(r.id));
  const someFilteredRoutesVisible = filteredRoutes.some(r => visibleRouteIds.has(r.id));

  const allFilteredPoisVisible = filteredPois.length > 0 && filteredPois.every(p => visiblePoiIds.has(p.id));
  const someFilteredPoisVisible = filteredPois.some(p => visiblePoiIds.has(p.id));

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
              <TabsList className="grid w-full grid-cols-4 bg-primary-foreground/20">
                  <TabsTrigger value="dispositivos" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Dispositivos</TabsTrigger>
                  <TabsTrigger value="geozonas" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Geozonas</TabsTrigger>
                  <TabsTrigger value="rutas" className="text-white data-[state=active]:bg-white data-[state=active]:text-primary">Rutas</TabsTrigger>
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
                    <div>
                      <div className="flex items-center justify-between px-4 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="toggle-all-geofences"
                            checked={allFilteredGeofencesVisible ? true : (someFilteredGeofencesVisible ? 'indeterminate' : false)}
                            onCheckedChange={(checked) => handleToggleAllGeofences(!!checked)}
                          />
                          <label htmlFor="toggle-all-geofences" className="font-semibold">Mostrar todas</label>
                        </div>
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                          {filteredGeofences.length}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        {filteredGeofences.map((geofence) => (
                          <GeofenceListItem
                            key={geofence.id}
                            geofence={geofence}
                            isVisible={visibleGeofenceIds.has(geofence.id)}
                            onVisibilityChange={toggleGeofenceVisibility}
                            onSelect={onSelectGeofence}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </TabsContent>
              <TabsContent value="rutas" className="m-0">
                {isLoading ? (
                  <DeviceListSkeleton />
                ) : (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="toggle-all-routes"
                          checked={allFilteredRoutesVisible ? true : (someFilteredRoutesVisible ? 'indeterminate' : false)}
                          onCheckedChange={(checked) => handleToggleAllRoutes(!!checked)}
                        />
                        <label htmlFor="toggle-all-routes" className="font-semibold">Mostrar todas</label>
                      </div>
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {filteredRoutes.length}
                      </span>
                    </div>
                    <div className="flex flex-col">
                        {filteredRoutes.map((route) => (
                          <RouteListItem
                            key={route.id}
                            route={route}
                            isVisible={visibleRouteIds.has(route.id)}
                            onVisibilityChange={toggleRouteVisibility}
                            onSelect={onSelectRoute}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="poi" className="m-0">
                {isLoading ? (
                  <DeviceListSkeleton />
                ) : (
                  <div>
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="toggle-all-pois"
                          checked={allFilteredPoisVisible ? true : (someFilteredPoisVisible ? 'indeterminate' : false)}
                          onCheckedChange={(checked) => handleToggleAllPois(!!checked)}
                        />
                        <label htmlFor="toggle-all-pois" className="font-semibold">Mostrar todos</label>
                      </div>
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {filteredPois.length}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      {filteredPois.map((poi) => (
                        <PoiListItem
                          key={poi.id}
                          poi={poi}
                          isVisible={visiblePoiIds.has(poi.id)}
                          onVisibilityChange={togglePoiVisibility}
                          onSelect={onSelectPOI}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
