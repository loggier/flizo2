
import { cn } from "@/lib/utils";

export function AutocenterIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
        <path d="M7 4H4v3M17 4h3v3M7 20H4v-3M17 20h3v-3" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}
