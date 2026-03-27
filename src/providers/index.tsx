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
import { SessionExpiryBanner } from "@/components/cart/SessionExpiryBanner";
import { usePayAtLast } from "@/hooks/usePayAtLast";
import { useCart } from "@/context/CartContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

/** Inner wrapper that has access to both CartContext and PayAtLast state */
function SessionExpiryBannerWrapper() {
  const { session } = usePayAtLast();
  const { setIsCartOpen } = useCart();

  const handlePayNow = () => {
    setIsCartOpen(true);
  };

  return <SessionExpiryBanner session={session} onPayNow={handlePayNow} />;
}

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
                    <SessionExpiryBannerWrapper />
                    <PWAInstallPrompt />
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

