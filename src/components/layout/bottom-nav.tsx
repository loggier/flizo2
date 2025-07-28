
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
    <nav className="fixed bottom-0 left-0 right-0 bg-teal-600 text-white p-2 shadow-[0_-1px_4px_rgba(0,0,0,0.1)] rounded-t-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-xs"
            >
              <div
                className={cn(
                  "p-3 rounded-lg flex flex-col items-center gap-1",
                  isActive ? "bg-red-500" : "bg-transparent"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
