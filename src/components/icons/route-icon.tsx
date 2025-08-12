
import { cn } from "@/lib/utils";

export function RouteIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 19.5a2.5 2.5 0 0 1 0-5c1.58 0 2.5-1 2.5-2.5S5.58 9.5 4 9.5s-2.5 1-2.5 2.5S2.42 14.5 4 14.5c1.58 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5" />
      <path d="M12 19.5a2.5 2.5 0 0 1 0-5c1.58 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5-2.5 1-2.5 2.5 1 2.5 2.5 2.5c1.58 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5" />
      <path d="M20 19.5a2.5 2.5 0 0 1 0-5c1.58 0 2.5-1 2.5-2.5s-1-2.5-2.5-2.5-2.5 1-2.5 2.5 1 2.5 2.5 2.5c1.58 0 2.5 1 2.5 2.5S21.58 19.5 20 19.5" />
    </svg>
  );
}
