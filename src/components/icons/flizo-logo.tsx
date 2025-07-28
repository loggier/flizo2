
import { cn } from "@/lib/utils";
import Image from "next/image";

export function FlizoLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const logoUrl = `${process.env.NEXT_PUBLIC_serverUrl}images/logo-main.png`;

  return (
    <Image
      src={logoUrl}
      alt="Flizo Copilot Logo"
      width={180}
      height={40}
      className={cn("w-auto h-10", className)}
      priority
      {...props}
    />
  );
}
