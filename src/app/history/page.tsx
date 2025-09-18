
"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getHistory, getAddress } from '@/services/flizo.service';
import type { Device, HistoryData, HistoryItem, HistoryPoint } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { LoaderIcon } from '@/components/icons/loader-icon';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import HistoryMap from '@/components/history/history-map';
import HistoryDetails from '@/components/history/history-details';
import HistoryPlaybackControls from '@/components/history/history-playback-controls';
import { storage } from '@/lib/storage';

function HistoryPageContent() {
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
    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<HistoryPoint | null>(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const animationRef = useRef<number | null>(null);

    const [routePath, setRoutePath] = useState<HistoryPoint[]>([]);
     
    useEffect(() => {
        const loadDevices = async () => {
            setIsLoading(true);
            const storedDevices = await storage.get('devices');
            if (storedDevices) {
                const allDevices: Device[] = JSON.parse(storedDevices);
                setDevices(allDevices);
                
                const urlParams = new URLSearchParams(window.location.search);
                const deviceId = urlParams.get('deviceId');
                if (deviceId) {
                    setSelectedVehicle(deviceId);
                }
            }
            setIsLoading(false);
        };
        loadDevices();
    }, []);

    useEffect(() => {
        if (map && selectedPoint) {
            const lat = parseFloat(selectedPoint.lat as any);
            const lng = parseFloat(selectedPoint.lng as any);
            if (!isNaN(lat) && !isNaN(lng)) {
                const position = { lat, lng };
                map.panTo(position);
                map.setZoom(18);
            }
        }
    }, [map, selectedPoint]);

    // Playback effect
    useEffect(() => {
        if (isPlaying && routePath.length > 1 && map) {
            const totalDuration = 60000; // 60 seconds
            const intervalTime = totalDuration / routePath.length / playbackSpeed;

            const animate = () => {
                setCurrentPointIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex >= routePath.length) {
                        setIsPlaying(false);
                        return prevIndex;
                    }
                    setProgress((nextIndex / (routePath.length - 1)) * 100);
                    
                    const nextPosition = routePath[nextIndex];
                    if (nextPosition) {
                        map.panTo({ lat: nextPosition.lat, lng: nextPosition.lng });
                    }

                    return nextIndex;
                });
            };

            animationRef.current = window.setInterval(animate, intervalTime);
        } else {
            if (animationRef.current) {
                clearInterval(animationRef.current);
                animationRef.current = null;
            }
        }

        return () => {
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, [isPlaying, playbackSpeed, routePath, map]);


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

    const processHistoryData = useCallback(async (data: HistoryData): Promise<HistoryData> => {
        const processedItems = await Promise.all(data.items.map(async (group) => {
            const pointToProcess = group.items[0];

            if (pointToProcess && !pointToProcess.address) {
                const latStr = (pointToProcess as any).lat ?? (pointToProcess as any).latitude;
                const lonStr = (pointToProcess as any).lng ?? (pointToProcess as any).longitude;

                const lat = parseFloat(latStr);
                const lon = parseFloat(lonStr);

                if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
                    try {
                        const address = await getAddress(lat, lon);
                        pointToProcess.address = address || 'Dirección no disponible';
                    } catch {
                        pointToProcess.address = 'No se pudo obtener la dirección';
                    }
                } else {
                    pointToProcess.address = 'Coordenadas no válidas';
                }
            }
            return group;
        }));

        const updatedData = { ...data, items: processedItems };
        setHistoryData(updatedData);
        return updatedData;
    }, []);

    const handleShowHistory = async () => {
        const token = await storage.get("user_api_hash");
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
        handleStop(); // Stop any previous playback
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
            if(result.items.length === 0){
                toast({
                    title: 'Sin Datos',
                    description: 'No se encontraron datos para el período seleccionado.',
                });
                setHistoryData(null);
            } else {
                setHistoryData(result); // Set raw data first
                processHistoryData(result); // Then process addresses in the background
                
                // Optimize and set route for playback
                const allPoints: HistoryPoint[] = result.items
                    .flatMap(group => group.items)
                    .map(p => ({ 
                        ...p, 
                        lat: parseFloat(p.lat as any), 
                        lng: parseFloat(p.lng as any) 
                    }))
                    .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
                
                const uniqueConsecutivePoints = allPoints.filter((point, index, self) => 
                    index === 0 || 
                    point.lat !== self[index - 1].lat || 
                    point.lng !== self[index - 1].lng
                );
                setRoutePath(uniqueConsecutivePoints);
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

    const handlePointSelect = (point: HistoryPoint) => {
        setSelectedPoint(point);
    };

    const handleMapClose = () => {
        setHistoryData(null);
        setSelectedPoint(null);
        setRoutePath([]);
        handleStop();
    }
    
    // Playback handlers
    const handlePlayPause = () => {
        if (routePath.length > 1) {
            setIsPlaying(!isPlaying);
        }
    };

    const handleStop = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentPointIndex(0);
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
    };
    
    const handleProgressChange = (newProgress: number[]) => {
        if (routePath.length === 0) return;
        const progressValue = newProgress[0];
        setProgress(progressValue);
        const newIndex = Math.floor(((routePath.length - 1) * progressValue) / 100);
        setCurrentPointIndex(newIndex);
        if (isPlaying) {
            setIsPlaying(false); // Pause when user interacts with slider
        }
    };


    if (historyData) {
        const selectedDevice = devices.find(d => d.id === Number(selectedVehicle));
        return (
            <div className="h-full w-full flex flex-col">
                <div className="h-1/2 w-full relative">
                    <HistoryMap 
                        history={historyData} 
                        onMapLoad={setMap} 
                        selectedPoint={selectedPoint}
                        onCloseInfoWindow={() => setSelectedPoint(null)}
                        playbackPoint={routePath[currentPointIndex]}
                        isPlaying={isPlaying}
                    />
                     <HistoryPlaybackControls
                        isPlaying={isPlaying}
                        progress={progress}
                        playbackSpeed={playbackSpeed}
                        onPlayPause={handlePlayPause}
                        onStop={handleStop}
                        onSpeedChange={handleSpeedChange}
                        onProgressChange={handleProgressChange}
                    />
                </div>
                <div className="h-1/2 w-full">
                   {selectedDevice && <HistoryDetails history={historyData} device={selectedDevice} onClose={handleMapClose} onPointSelect={handlePointSelect} />}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6">
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
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="true">Sí</SelectItem>
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

    
