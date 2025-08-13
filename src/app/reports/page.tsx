
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateReport } from '@/services/flizo.service';
import type { Device } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, BarChart, Ban, Route as RouteIcon, List, Info, Loader } from 'lucide-react';
import { LoaderIcon } from '@/components/icons/loader-icon';
import ReportViewerModal from '@/components/reports/report-viewer-modal';

const reportTypes = [
    { title: 'Información', icon: Info, type: 1 },
    { title: 'Recorridos', icon: TrendingUp, type: 3 },
    { title: 'Eventos', icon: BarChart, type: 8 },
    { title: 'Geocercas', icon: Ban, type: 53 },
    { title: 'Horas de trabajo', icon: List, type: 48 },
    { title: 'Rutas', icon: RouteIcon, type: 43 },
];

function ReportsPageContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState('today');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState<number | null>(null);
    const [reportUrl, setReportUrl] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    useEffect(() => {
        const setDatesBasedOnSelectedDay = () => {
            const today = new Date();
            let from: Date, to: Date;

            switch (selectedDay) {
                case 'yesterday':
                    from = new Date(today);
                    from.setDate(today.getDate() - 1);
                    to = new Date(from);
                    break;
                case 'last7days':
                    from = new Date(today);
                    from.setDate(today.getDate() - 6);
                    to = new Date(today);
                    break;
                case 'today':
                default:
                    from = new Date(today);
                    to = new Date(today);
                    break;
            }

            from.setHours(0, 0, 0, 0);
            to.setHours(23, 59, 59, 999);
            
            const formatDate = (date: Date) => {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            };
            
            setDateFrom(formatDate(from));
            setDateTo(formatDate(to));
        };

        setDatesBasedOnSelectedDay();
    }, [selectedDay]);

    const handleGenerateReport = async (type: number) => {
        const token = localStorage.getItem("user_api_hash") || sessionStorage.getItem("user_api_hash");
        if (!token || !selectedVehicle) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se ha seleccionado un vehículo o falta el token de autenticación.',
            });
            return;
        }

        setIsGenerating(type);
        try {
            const params = {
                devices: [Number(selectedVehicle)],
                date_from: dateFrom,
                date_to: dateTo,
                format: 'html',
                type: type,
            };
            const result = await generateReport(token, params);
            if (result?.url) {
                const response = await fetch(result.url);
                if (!response.ok) {
                    throw new Error('Failed to download report content');
                }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setReportUrl(blobUrl);
                setDownloadUrl(result.url);
                setIsModalOpen(true);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
            toast({
                variant: 'destructive',
                title: 'Error al generar reporte',
                description: errorMessage,
            });
        } finally {
            setIsGenerating(null);
        }
    };

    const handleCloseModal = () => {
        if (reportUrl) {
            URL.revokeObjectURL(reportUrl);
        }
        setIsModalOpen(false);
        setReportUrl(null);
        setDownloadUrl(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoaderIcon className="h-10 w-10 text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Card className="p-4 space-y-4">
                <div>
                    <Label htmlFor="vehicle-select">Dispositivos</Label>
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
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger id="day-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="yesterday">Ayer</SelectItem>
                            <SelectItem value="last7days">Últimos 7 días</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                {reportTypes.map(report => (
                    <Button
                        key={report.type}
                        variant="outline"
                        className="h-28 flex-col gap-2 bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleGenerateReport(report.type)}
                        disabled={isGenerating === report.type || !selectedVehicle}
                    >
                        {isGenerating === report.type ? (
                            <Loader className="h-8 w-8 text-primary animate-spin" />
                        ) : (
                           <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                             <report.icon className="h-6 w-6 text-primary" />
                           </div>
                        )}
                        <span className="font-semibold">{report.title}</span>
                    </Button>
                ))}
            </div>
             <ReportViewerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                reportUrl={reportUrl}
                downloadUrl={downloadUrl}
            />
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ReportsPageContent />
        </Suspense>
    );
}
