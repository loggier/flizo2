
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
    <nav className="fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
      <div className="flex h-16 w-full max-w-sm items-center justify-around rounded-full border border-border/20 bg-background/80 p-2 shadow-2xl shadow-primary/10 backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 h-full flex items-center justify-center"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs transition-all duration-300 ease-in-out",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold rounded-full shadow-lg p-3 scale-110"
                    : "text-muted-foreground hover:text-foreground h-full w-full"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "w-6 h-6")} />
                <span className={cn("truncate", { "hidden": isActive })}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
