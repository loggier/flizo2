
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getHistory } from '@/services/flizo.service';
import type { Device } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LoaderIcon } from '@/components/icons/loader-icon';
import { DateTimePicker } from '@/components/ui/datetime-picker';

function HistoryPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().setHours(0, 0, 0, 0)));
    const [dateTo, setDateTo] = useState<Date>(new Date(new Date().setHours(23, 59, 59, 999)));
    const [dayOption, setDayOption] = useState('today');
    const [snapToRoad, setSnapToRoad] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [historyData, setHistoryData] = useState<any | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const storedDevices = localStorage.getItem('devices');
        if (storedDevices) {
            setDevices(JSON.parse(storedDevices));
        }
        
        const deviceId = searchParams.get('deviceId');
        if (deviceId) {
            setSelectedVehicle(deviceId);
        }
        setIsLoading(false);
    }, [searchParams]);

    const handleDayOptionChange = (value: string) => {
        setDayOption(value);
        const now = new Date();
        let from = new Date();
        let to = new Date();

        switch (value) {
            case 'today':
                from.setHours(0, 0, 0, 0);
                to.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                from.setDate(now.getDate() - 1);
                from.setHours(0, 0, 0, 0);
                to.setDate(now.getDate() - 1);
                to.setHours(23, 59, 59, 999);
                break;
        }
        setDateFrom(from);
        setDateTo(to);
    };

    const formatDate = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const formatTime = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const handleShowHistory = async () => {
        const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
        if (!token || !selectedVehicle) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Por favor, seleccione un vehículo.',
            });
            return;
        }
        if (dateFrom > dateTo) {
            toast({
                variant: 'destructive',
                title: 'Error en Fechas',
                description: 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".',
            });
            return;
        }

        setIsFetchingHistory(true);
        setHistoryData(null);
        try {
            const params = {
                device_id: Number(selectedVehicle),
                from_date: formatDate(dateFrom),
                from_time: formatTime(dateFrom),
                to_date: formatDate(dateTo),
                to_time: formatTime(dateTo),
                snap_to_road: snapToRoad,
            };
            const result = await getHistory(token, params);
            setHistoryData(result);
            if(result.items.length === 0){
                toast({
                    title: 'Sin Datos',
                    description: 'No se encontraron datos para el período seleccionado.',
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
            toast({
                variant: 'destructive',
                title: 'Error al obtener historial',
                description: errorMessage,
            });
        } finally {
            setIsFetchingHistory(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <Label htmlFor="vehicle-select">Dispositivo</Label>
                        <Select value={selectedVehicle || ''} onValueChange={setSelectedVehicle}>
                            <SelectTrigger id="vehicle-select">
                                <SelectValue placeholder="Seleccione un vehículo" />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.map(device => (
                                    <SelectItem key={device.id} value={device.id.toString()}>
                                        {device.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="day-select">Mostrar día</Label>
                        <Select value={dayOption} onValueChange={handleDayOptionChange}>
                            <SelectTrigger id="day-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Hoy</SelectItem>
                                <SelectItem value="yesterday">Ayer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Desde</Label>
                        <DateTimePicker date={dateFrom} setDate={setDateFrom} />
                    </div>
                    <div>
                        <Label>Hasta</Label>
                        <DateTimePicker date={dateTo} setDate={setDateTo} disabled={{ before: dateFrom }}/>
                    </div>
                    <div>
                        <Label htmlFor="snap-select">Ajustar a carretera</Label>
                        <Select value={snapToRoad.toString()} onValueChange={(val) => setSnapToRoad(val === 'true')}>
                            <SelectTrigger id="snap-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={handleShowHistory} disabled={isFetchingHistory}>
                            {isFetchingHistory ? <LoaderIcon className="mr-2" /> : null}
                            Mostrar historial
                        </Button>
                         <Button variant="outline" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {historyData && (
                 <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold mb-2">Resultado del Historial</h3>
                        <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                            {JSON.stringify(historyData, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <HistoryPageContent />
        </Suspense>
    );
}
