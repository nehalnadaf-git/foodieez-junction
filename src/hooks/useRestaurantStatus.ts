"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOperatingHours } from "@/hooks/useOperatingHours";

/**
 * Hook to manage restaurant open/closed status via Convex.
 * Handles automatic schedule vs manual override — all state is cloud-synced.
 */
export function useRestaurantStatus() {
  const operatingHours = useOperatingHours();
  const statusData = useQuery(api.restaurantStatus.get);
  const updateStatus = useMutation(api.restaurantStatus.update);
  const [currentTimeIST, setCurrentTimeIST] = useState("");
  const status = statusData ?? {
    isOpen: true,
    manualOverride: false,
    closedMessage: "We are currently closed. We will be back soon!",
  };

  // Update time every 10 seconds for accuracy near minute boundaries
  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      });
      setCurrentTimeIST(formatter.format(new Date()) + " IST");
    };

    updateTime();
    const ticker = setInterval(updateTime, 10000);
    return () => clearInterval(ticker);
  }, []);

  // Determine effective open state
  const manualOverride = status.manualOverride;
  const isOpen = manualOverride
    ? status.isOpen
    : operatingHours.isOpen;

  const closedMessage = status.closedMessage;

  const manuallyClose = async (message: string) => {
    await updateStatus({ isOpen: false, manualOverride: true, closedMessage: message });
  };

  const manuallyOpen = async (returnToSchedule: boolean) => {
    if (returnToSchedule) {
      await updateStatus({ manualOverride: false });
    } else {
      await updateStatus({ isOpen: true, manualOverride: true });
    }
  };

  return {
    /** True if restaurant is effectively taking orders. */
    isOpen,
    /** True if admin has set a manual override. */
    isManualOverride: manualOverride,
    /** Custom closed message set by admin. */
    closedMessage,
    /** Force close with a message. */
    manuallyClose,
    /** Open manually or restore automatic schedule. */
    manuallyOpen,
    /** Current IST time string, updates every 10s. */
    currentTimeIST,
  };
}
