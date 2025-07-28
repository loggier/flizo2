
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { LogOut, MapPin, Truck, Bell } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function DashboardClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useLanguage();
  const dashboardTranslations = t.dashboard;

  useEffect(() => {
    const token = localStorage.getItem('user_api_hash') || sessionStorage.getItem('user_api_hash');
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.replace('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_api_hash');
    sessionStorage.removeItem('user_api_hash');
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
        <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-24" />
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-3xl font-bold">{dashboardTranslations.welcome}</CardTitle>
                <CardDescription>{dashboardTranslations.description}</CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {dashboardTranslations.logout}
            </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dashboardTranslations.activeVehicles}
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardTranslations.activeVehiclesDescription}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dashboardTranslations.liveTracking}
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardTranslations.liveTrackingDescription}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{dashboardTranslations.alerts}</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardTranslations.alertsDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
