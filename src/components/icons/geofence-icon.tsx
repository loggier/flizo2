
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
      <path d="M12 5L20 19L4 19L12 5Z" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="5" r="2" fill="currentColor" strokeWidth="0" />
      <circle cx="20" cy="19" r="2" fill="currentColor" strokeWidth="0" />
      <circle cx="4" cy="19" r="2" fill="currentColor" strokeWidth="0" />
    </svg>
  );
}
