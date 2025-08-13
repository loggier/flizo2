
"use client";

import { Input } from "@/components/ui/input";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

// Note: This is a skeleton component. The search functionality will be passed via props from the page.
export function AlertsHeader() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground shadow-md p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filtrar alertas"
            className="w-full rounded-full bg-background text-foreground pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary/80">
          <Link href="/alerts/settings">
            <Bell className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
