
"use client";

import { Button } from "@/components/ui/button";
import { Layers, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeofenceIcon } from "../icons/geofence-icon";

interface MapControlsProps {
  onLayerChange: () => void;
  onLocateUser: () => void;
  onToggleGeofences: () => void;
  showGeofences: boolean;
}

export default function MapControls({ 
  onLayerChange, 
  onLocateUser,
  onToggleGeofences,
  showGeofences
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
        onClick={onLocateUser}
      >
        <Crosshair className="h-6 w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-full shadow-md hover:bg-primary hover:text-primary-foreground"
        onClick={onLayerChange}
      >
        <Layers className="h-6 w-6" />
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
    </div>
  );
}
