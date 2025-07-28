
import { cn } from "@/lib/utils";
import Image from "next/image";

export function FlizoLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const serverUrl = process.env.NEXT_PUBLIC_serverUrl || 'https://s1.flizo.app/';
  const logoUrl = `${serverUrl}images/logo-main.png`;

  return (
    <Image
      src={logoUrl}
      alt="Flizo Copilot Logo"
      width={288}
      height={64}
      className={cn("w-auto h-16", className)}
      priority
      {...props}
    />
  );
}
