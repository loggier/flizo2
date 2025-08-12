
import { cn } from "@/lib/utils";

export function GeofenceIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
        <path d="M18.33,14.63a4.09,4.09,0,0,0-7.77-1.42L5.7,9.43A4.1,4.1,0,1,0,4,11.37a4,4,0,0,0,.68-2.22l4.87,3.78a4.09,4.09,0,1,0,8.78,1.7ZM18.33,4.1a2,2,0,1,1-2,2A2,2,0,0,1,18.33,4.1ZM4,9.37a2,2,0,1,1,2-2A2,2,0,0,1,4,9.37Zm14.33,7.26a2,2,0,1,1,2-2A2,2,0,0,1,18.33,16.63Z"/>
    </svg>
  );
}
