
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
    <nav className="fixed bottom-0 inset-x-0 h-20 z-50 pointer-events-none">
       <div className="relative h-full w-full max-w-lg mx-auto">
        <svg
            className="absolute bottom-0 w-full h-auto drop-shadow-2xl"
            viewBox="0 0 375 84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 24C0 12.9543 8.95431 4 20 4H355C366.046 4 375 12.9543 375 24V84H0V24Z"
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
                        "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                        isActive ? "bg-primary/10" : ""
                    )}>
                        <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
            );
            })}
        </div>
       </div>
    </nav>
  );
}
