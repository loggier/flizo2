
import { cn } from "@/lib/utils";

export function ClusterIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 19.4a3 3 0 1 0-4.8-3.2" />
        <path d="M4.6 19.4a3 3 0 1 0 4.8-3.2" />
        <path d="M12 4.04A3 3 0 0 0 9.17 8.8" />
    </svg>
  );
}
