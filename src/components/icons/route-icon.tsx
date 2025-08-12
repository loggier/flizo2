
import { cn } from "@/lib/utils";

export function RouteIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 124 124"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.34 0.25h26.68l27.17 122.88H21.81L48.34 0.25zM59.95 7.96h3.93l0.54 13.55h-5.29L59.95 7.96zM58.64 33.12h6.55l0.86 19.21h-8.33L58.64 33.12zM56.85 63.86h9.84l1.14 19.21h-11.9L56.85 63.86zM55.68 94.71h12.53l0.99 21.71h-15.06l1.54-21.84z"
      />
    </svg>
  );
}
