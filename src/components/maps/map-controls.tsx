
"use client";

import { Button } from "@/components/ui/button";
import { Layers, Crosshair, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeofenceIcon } from "../icons/geofence-icon";
import { RouteIcon } from "../icons/route-icon";
import { AutocenterIcon } from "../icons/autocenter-icon";
import { ClusterIcon } from "../icons/cluster-icon";

interface MapControlsProps {
  isFollowing?: boolean;
  onLayerChange: () => void;
  onLocateUser: () => void;
  onToggleGeofences: () => void;
  showGeofences: boolean;
  onToggleRoutes: () => void;
  showRoutes: boolean;
  onToggleAutoCenter: () => void;
  autoCenter: boolean;
  onTogglePOIs: () => void;
  showPOIs: boolean;
  onToggleCluster: () => void;
  showCluster: boolean;
}

export default function MapControls({ 
  isFollowing = false,
  onLayerChange, 
  onLocateUser,
  onToggleGeofences,
  showGeofences,
  onToggleRoutes,
  showRoutes,
  onToggleAutoCenter,
  autoCenter,
  onTogglePOIs,
  showPOIs,
  onToggleCluster,
  showCluster,
}: MapControlsProps) {

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    action();
    e.currentTarget.blur();
  }

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
        onClick={(e) => handleActionClick(e, onLocateUser)}
      >
        <Crosshair className="h-6 w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
        onClick={(e) => handleActionClick(e, onLayerChange)}
      >
        <Layers className="h-6 w-6" />
      </Button>
      {!isFollowing && (
        <>
          <Button 
            variant={autoCenter ? "default" : "outline"}
            size="icon" 
            className={cn(
              "bg-background rounded-full shadow-md",
              autoCenter ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={onToggleAutoCenter}
          >
            <AutocenterIcon className="h-6 w-6" />
          </Button>
          <Button 
            variant={showGeofences ? "default" : "outline"}
            size="icon" 
            className={cn(
              "bg-background rounded-full shadow-md",
              showGeofences ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={onToggleGeofences}
          >
            <GeofenceIcon className="h-6 w-6" />
          </Button>
          <Button 
            variant={showRoutes ? "default" : "outline"}
            size="icon" 
            className={cn(
              "bg-background rounded-full shadow-md",
              showRoutes ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={onToggleRoutes}
          >
            <RouteIcon className="h-6 w-6" />
          </Button>
          <Button 
            variant={showPOIs ? "default" : "outline"}
            size="icon" 
            className={cn(
              "bg-background rounded-full shadow-md",
              showPOIs ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={onTogglePOIs}
          >
            <MapPin className="h-6 w-6" />
          </Button>
          <Button 
            variant={showCluster ? "default" : "outline"}
            size="icon" 
            className={cn(
              "bg-background rounded-full shadow-md",
              showCluster ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-primary hover:text-primary-foreground"
            )}
            onClick={onToggleCluster}
          >
            <ClusterIcon className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
