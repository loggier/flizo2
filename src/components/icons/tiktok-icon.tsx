
import { cn } from "@/lib/utils";

export function TikTokIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className={cn(className)}
        {...props}
    >
        <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.59H9.83a2.592 2.592 0 0 1-2.59-2.59V8.67H4.15v6.73a5.682 5.682 0 0 0 5.68 5.68h.03a5.682 5.682 0 0 0 5.68-5.68V5.82z">
        </path>
    </svg>
  );
}
