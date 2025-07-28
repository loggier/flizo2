import { cn } from "@/lib/utils";

export function FlizoLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 50"
      className={cn("w-auto h-10", className)}
      {...props}
    >
      <style>
        {`
          .flizo-text {
            fill: hsl(var(--foreground));
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            font-size: 36px;
          }
          .flizo-pin {
            fill: hsl(var(--primary));
          }
        `}
      </style>
      <g>
        <path
          className="flizo-pin"
          d="M20,0C8.96,0,0,8.96,0,20c0,14,16.28,30,20,30s20-16,20-30C40,8.96,31.04,0,20,0z M20,28c-4.42,0-8-3.58-8-8s3.58-8,8-8 s8,3.58,8,8S24.42,28,20,28z"
        />
        <text x="50" y="35" className="flizo-text">
          Flizo Copilot
        </text>
      </g>
    </svg>
  );
}
