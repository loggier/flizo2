
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/services/flizo.service';
import type { AlertEvent } from '@/lib/types';
import { AlertCard } from '@/components/alerts/alert-card';
import { AlertsListSkeleton } from '@/components/alerts/alerts-list-skeleton';

export default function AlertsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const fetchedEvents = await getEvents(token);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        if ((error as Error).message === 'Unauthorized') {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // This is a placeholder for the search functionality that will be implemented in the header
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  if (isLoading) {
    return <AlertsListSkeleton />;
  }

  return (
    <div className="p-4 space-y-4">
      {filteredEvents.length > 0 ? (
        filteredEvents.map(event => (
          <AlertCard key={event.id} event={event} />
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron alertas.</p>
        </div>
      )}
    </div>
  );
}
