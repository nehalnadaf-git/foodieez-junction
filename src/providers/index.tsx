"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import MaintenanceGate from "@/components/MaintenanceGate";
import { AppSettingsProvider } from "@/context/AppSettingsContext";
import { TableProvider } from "@/context/TableContext";
import { CartProvider } from "./CartProvider";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { ConvexClientProvider } from "./ConvexClientProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <QueryProvider>
        <TooltipProvider>
          <ThemeProvider>
            <AppSettingsProvider>
              <MaintenanceGate>
                <TableProvider>
                  <CartProvider>
                    <Toaster />
                    <Sonner />
                    {children}
                  </CartProvider>
                </TableProvider>
              </MaintenanceGate>
            </AppSettingsProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryProvider>
    </ConvexClientProvider>
  );
}
