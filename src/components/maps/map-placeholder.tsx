
import Image from "next/image";

export default function MapPlaceholder() {
  return (
    <div className="h-full w-full">
      <Image
        src="https://placehold.co/1080x1920.png"
        alt="World Map"
        layout="fill"
        objectFit="cover"
        data-ai-hint="world map"
      />
    </div>
  );
}
