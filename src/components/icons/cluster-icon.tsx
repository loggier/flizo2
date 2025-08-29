
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
      <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M17 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M10.14 6.33 14 15" />
      <path d="M7.77 15.24 5.86 18" />
    </svg>
  );
}
