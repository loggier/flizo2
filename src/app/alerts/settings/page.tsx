
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAlerts, updateAlertStatus } from '@/services/flizo.service';
import type { AlertSetting } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function AlertSettingItem({ alert, onStatusChange }: { alert: AlertSetting, onStatusChange: (id: number, active: boolean) => Promise<void> }) {
  const [isChecked, setIsChecked] = useState(alert.active === 1);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckedChange = async (checked: boolean) => {
    setIsUpdating(true);
    await onStatusChange(alert.id, checked);
    setIsChecked(checked);
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{alert.name}</p>
        <p className="text-sm text-gray-500">{alert.type}</p>
      </div>
      <Switch
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={isUpdating}
        aria-label={`Activar o desactivar la alerta ${alert.name}`}
      />
    </div>
  );
}

function SettingsSkeleton() {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border-b">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-11 rounded-full" />
            </div>
        ))}
      </div>
    );
  }

export default function AlertsSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
      if (!token) {
        router.push("/");
        return;
      }
      try {
        const fetchedAlerts = await getAlerts(token);
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        if ((error as Error).message === 'Unauthorized') {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/");
        } else {
            toast({
                variant: 'destructive',
                title: 'Error al cargar alertas',
                description: 'No se pudieron obtener las configuraciones de alertas.',
            });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [router, toast]);

  const handleStatusChange = async (id: number, active: boolean) => {
    const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
    if (!token) {
        router.push("/");
        return;
    }
    
    try {
        await updateAlertStatus(token, id, active);
        toast({
            title: 'Actualización exitosa',
            description: `La alerta ha sido ${active ? 'activada' : 'desactivada'}.`,
        });
        // Update local state to reflect change immediately
        setAlerts(prevAlerts => prevAlerts.map(alert => 
            alert.id === id ? { ...alert, active: active ? 1 : 0 } : alert
        ));
    } catch (error) {
        console.error("Failed to update alert status:", error);
        toast({
            variant: 'destructive',
            title: 'Error al actualizar',
            description: 'No se pudo cambiar el estado de la alerta.',
        });
         // Revert the switch state on failure by re-fetching or flipping the local state back
         setAlerts(prevAlerts => [...prevAlerts]);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="divide-y divide-gray-200">
      {alerts.map(alert => (
        <AlertSettingItem key={alert.id} alert={alert} onStatusChange={handleStatusChange} />
      ))}
       {alerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron configuraciones de alertas.</p>
          </div>
        )}
    </div>
  );
}
