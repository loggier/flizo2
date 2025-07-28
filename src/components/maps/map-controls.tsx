
"use client";

import { Button } from "@/components/ui/button";
import { Layers, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onLayerChange: () => void;
  onLocateUser: () => void;
}

export default function MapControls({ onLayerChange, onLocateUser }: MapControlsProps) {
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
    </div>
  );
}
