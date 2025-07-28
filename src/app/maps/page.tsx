
import MapPlaceholder from "@/components/maps/map-placeholder";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function MapsPage() {
  return (
    <div className="relative h-full w-full">
      <MapPlaceholder />
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="icon" className="bg-background rounded-full shadow-md">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
