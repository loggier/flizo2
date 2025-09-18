
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from '@/hooks/use-language';
import { VehicleFilterProvider } from '@/hooks/use-vehicle-filter';
import { useAuth } from '@/hooks/use-auth';
import { LoaderIcon } from '@/components/icons/loader-icon';

function AppContent({ children }: { children: React.ReactNode }) {
  const { isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderIcon className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // If we are on the login page, render it.
  // The useAuth hook will handle redirection if the user is already authenticated.
  // If not authenticated and not on login, useAuth will redirect to login.
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <head>
        <title>Flizo Copilot</title>
        <meta name="description" content="Vehicle Tracking and Management" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <VehicleFilterProvider>
            <AppContent>
              {children}
            </AppContent>
          </VehicleFilterProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
