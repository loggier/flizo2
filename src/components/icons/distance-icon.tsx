
import { cn } from "@/lib/utils";

export function DistanceIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn(className)} {...props}>
        <path d="M4 17.5l4-4 4 4 4-4 4 4"/>
        <path d="M4 5.5l4 4 4-4 4 4 4-4"/>
    </svg>
  );
}
