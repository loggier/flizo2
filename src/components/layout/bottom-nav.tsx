
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
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t border-border/20 z-50">
      <div className="flex h-16 w-full max-w-md mx-auto items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-300",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs truncate">{item.label}</span>
               {isActive && (
                <div className="w-12 h-1 bg-primary rounded-t-full absolute bottom-0"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
