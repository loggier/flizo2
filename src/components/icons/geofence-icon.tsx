
import { cn } from "@/lib/utils";

export function GeofenceIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
      {...props}
    >
      <path d="M12 8L22 18L2 18Z" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="8" r="2" fill="currentColor" strokeWidth="0" />
      <circle cx="22" cy="18" r="2" fill="currentColor" strokeWidth="0" />
      <circle cx="2" cy="18" r="2" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}
