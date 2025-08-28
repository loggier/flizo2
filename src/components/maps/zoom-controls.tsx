
"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-md shadow-md hover:bg-primary hover:text-primary-foreground h-10 w-10"
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="bg-background rounded-md shadow-md hover:bg-primary hover:text-primary-foreground h-10 w-10"
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        <Minus className="h-6 w-6" />
      </Button>
    </div>
  );
}
