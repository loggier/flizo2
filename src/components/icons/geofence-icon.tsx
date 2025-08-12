
import { cn } from "@/lib/utils";

export function GeofenceIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <polygon points="12,3 21,10 17,20 5,18 3,8" fill="currentColor" fillOpacity="0.3" />
      <circle cx="12" cy="3" r="2" fill="currentColor" />
      <circle cx="21" cy="10" r="2" fill="currentColor" />
      <circle cx="17" cy="20" r="2" fill="currentColor" />
      <circle cx="5" cy="18" r="2" fill="currentColor" />
      <circle cx="3" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}
