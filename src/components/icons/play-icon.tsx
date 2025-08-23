
import { cn } from "@/lib/utils";

export function PlayIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
            className={cn(className)}
            {...props}
        >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    );
}

    