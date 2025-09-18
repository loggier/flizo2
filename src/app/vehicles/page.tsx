
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getDevices } from '@/services/flizo.service';
import type { Device, DeviceGroup } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { VehicleListSkeleton } from '@/components/vehicles/vehicle-list-skeleton';
import { useVehicleFilter } from '@/hooks/use-vehicle-filter';
import { storage } from '@/lib/storage';

export type VehicleStatus = 'all' | 'moving' | 'stopped' | 'offline';

export default function VehiclesPage() {
  const router = useRouter();
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchTerm, statusFilter, setStatusFilter, setSearchTerm } = useVehicleFilter();

  const fetchAndSetDevices = async () => {
    if (!isLoading) setIsLoading(true);
    const token = await storage.get("user_api_hash");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const fetchedGroups = await getDevices(token);
      setDeviceGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      if ((error as Error).message === 'Unauthorized') {
        storage.remove("user_api_hash");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAndSetDevices();
    const intervalId = setInterval(fetchAndSetDevices, 30000);
    return () => clearInterval(intervalId);
  }, [router]);

  const getStatus = (device: Device): VehicleStatus => {
    switch (device.online) {
      case 'moving':
        return 'moving';
      case 'engine':
      case 'online':
      case 'stopped':
      case 'ack':
        return 'stopped';
      case 'offline':
        return 'offline';
      default:
        return 'offline';
    }
  };

  const filteredDeviceGroups = useMemo(() => {
    return deviceGroups
      .map(group => {
        const filteredItems = group.items.filter(device => {
          const nameMatch = device.name.toLowerCase().includes(searchTerm.toLowerCase());
          const statusMatch = statusFilter === 'all' || getStatus(device) === statusFilter;
          return nameMatch && statusMatch;
        });
        return { ...group, items: filteredItems };
      })
      .filter(group => group.items.length > 0);
  }, [deviceGroups, searchTerm, statusFilter]);
  
  const handleVehicleClick = (device: Device) => {
    storage.set('selectedDeviceId', device.id.toString());
    router.push('/maps');
  };

  if (isLoading && deviceGroups.length === 0) {
    return <VehicleListSkeleton />;
  }

  return (
    <div className="p-4 space-y-4">
      {filteredDeviceGroups.length > 0 ? (
        <Accordion type="multiple" defaultValue={filteredDeviceGroups.map(g => g.id.toString())} className="w-full space-y-4">
          {filteredDeviceGroups.map((group) => (
            <AccordionItem value={group.id.toString()} key={group.id} className="border-none">
              <AccordionTrigger className="bg-card p-3 rounded-lg shadow-sm hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">{group.title}</span>
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {group.items.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4">
                {group.items.map((device) => (
                  <VehicleCard key={device.id} device={device} onClick={() => handleVehicleClick(device)} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron vehículos.</p>
        </div>
      )}
    </div>
  );
}

    
