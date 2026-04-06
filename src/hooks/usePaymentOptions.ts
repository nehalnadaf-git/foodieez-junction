"use client";

import { useTableNumber } from "@/hooks/useTableNumber";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface PaymentOptions {
  showCash: boolean;
  showUPI: boolean;
}

/**
 * Derives which payment methods should be shown for a given order type.
 *
 * Payment matrix:
 *  - Dine-In (always QR): Cash ✅  UPI ✅
 *  - Takeaway + QR:        Cash ✅  UPI ✅
 *  - Takeaway (no QR):     Cash ❌  UPI ✅
 *  - Delivery:             Cash depends on admin toggle  UPI ✅
 */
export function usePaymentOptions(
  orderType: "takeaway" | "dine-in" | "delivery" | null
): PaymentOptions {
  const { tableNumber } = useTableNumber();
  const isQRScan = !!tableNumber;

  // Delivery-specific UPI-only restriction — defaults to false (cash also available)
  const restrictUPIOnly =
    useQuery(api.appSettings.getDeliveryRestrictUPIOnly) ?? false;

  if (orderType === "dine-in") {
    // Dine-In requires QR, so both options are always available
    return { showCash: true, showUPI: true };
  }

  if (orderType === "takeaway") {
    return {
      showCash: isQRScan, // Cash unlocked only by QR scan
      showUPI: true,      // UPI always available
    };
  }

  if (orderType === "delivery") {
    return {
      showCash: !restrictUPIOnly, // Cash available when toggle is OFF (default)
      showUPI: true,
    };
  }

  // null — no type selected yet; default to UPI only
  return { showCash: false, showUPI: true };
}
