
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Car, Bell, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navTranslations = t.bottomNav;

  const navItems = [
    { href: "/maps", label: navTranslations.map, icon: Map },
    { href: "/vehicles", label: navTranslations.vehicles, icon: Car },
    { href: "/alerts", label: navTranslations.alerts, icon: Bell },
    { href: "/settings", label: navTranslations.settings, icon: Settings },
    { href: "/help", label: navTranslations.help, icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 z-50 pointer-events-none">
       <div className="relative h-full w-full max-w-lg mx-auto">
        <svg
            className="absolute bottom-0 w-full h-auto drop-shadow-2xl"
            viewBox="0 0 375 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 20C0 8.95431 8.95431 0 20 0H355C366.046 0 375 8.95431 375 20V64H0V20Z"
                className="fill-background"
            />
        </svg>

        <div className="absolute bottom-0 w-full h-16 flex items-center justify-around pointer-events-auto">
            {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200",
                    isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                >
                    <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                        isActive ? "bg-primary/10" : ""
                    )}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium truncate">{item.label}</span>
                </Link>
            );
            })}
        </div>
       </div>
    </nav>
  );
}
