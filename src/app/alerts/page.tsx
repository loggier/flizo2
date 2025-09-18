
"use client";

import { useState, useEffect, useMemo, useRef }
from 'react';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/flizo.service';
import type { AlertEvent, Device } from '@/lib/types';
import { AlertCard } from '@/components/alerts/alert-card';
import { AlertsListSkeleton } from '@/components/alerts/alerts-list-skeleton';
import MapComponent from '@/components/maps/map-placeholder';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storage } from '@/lib/storage';

export default function AlertsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AlertEvent | null>(null);
  const allDevicesRef = useRef<Device[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const token = await storage.get("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const [fetchedEvents, devicesFromStorage] = await Promise.all([
          getEvents(token),
          storage.get('devices').then(d => d ? JSON.parse(d) : [])
        ]);
        
        setEvents(fetchedEvents);
        allDevicesRef.current = devicesFromStorage;

      } catch (error) {
        console.error("Failed to fetch events:", error);
        if ((error as Error).message === 'Unauthorized') {
          storage.remove("user_api_hash");
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  useEffect(() => {
    if (map && selectedEvent) {
      const position = { lat: selectedEvent.latitude, lng: selectedEvent.longitude };
      map.panTo(position);
      map.setZoom(16);
    }
  }, [map, selectedEvent]);
  
  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleSelectEvent = (event: AlertEvent) => {
    setSelectedEvent(event);
  };

  const handleDeselectEvent = () => {
    setSelectedEvent(null);
  }

  const getDeviceForEvent = (event: AlertEvent | null): Device | undefined => {
    if (!event) return undefined;
    return allDevicesRef.current.find(d => d.id === event.device_id);
  }

  const selectedDevice = getDeviceForEvent(selectedEvent);

  return (
    <>
      <div className="h-1/2 w-full relative">
        <MapComponent
          mapType="OSM"
          onMapLoad={setMap}
          userPosition={null}
          heading={0}
          devices={selectedDevice ? [selectedDevice] : []}
          geofences={[]}
          routes={[]}
          pois={[]}
          showLabels={false}
          onSelectDevice={() => {}}
          onDeselectDevice={handleDeselectEvent}
          selectedAlert={selectedEvent}
          selectedDeviceForAlert={selectedDevice}
        />
      </div>
      <div className="h-1/2 w-full">
        <ScrollArea className="h-full">
          {isLoading ? (
             <AlertsListSkeleton />
          ) : (
            <div className="p-4 space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => {
                  const device = getDeviceForEvent(event);
                  return (
                    <AlertCard key={event.id} event={event} onSelect={handleSelectEvent} deviceIconUrl={device?.icon?.path}/>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron alertas.</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
