"use client";

import { useState, useEffect } from "react";
import {
  getRestaurantStatus,
  isRestaurantOpen,
  manuallyClose as utilManuallyClose,
  manuallyOpen as utilManuallyOpen,
  returnToSchedule as utilReturnToSchedule,
} from "@/utils/restaurantStatus";
import { useOperatingHours } from "@/hooks/useOperatingHours";

/**
 * Hook to manage restaurant open/closed status.
 * Handles automatic schedules vs manual overrides.
 */
export function useRestaurantStatus() {
  const operatingHours = useOperatingHours();
  const [status, setStatus] = useState(getRestaurantStatus);
  const [currentTimeIST, setCurrentTimeIST] = useState("");

  // Sync with localStorage changes across components/tabs
  useEffect(() => {
    function handleStorageChange(e: Event | StorageEvent) {
      if (e instanceof StorageEvent && e.key !== "fj_restaurant_status") return;
      setStatus(getRestaurantStatus());
    }

    window.addEventListener("fj_status_changed", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    
    // Initial fetch to guarantee hydration correctness
    setStatus(getRestaurantStatus());

    return () => {
      window.removeEventListener("fj_status_changed", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Update time every 10 seconds to ensure high accuracy near minute changes
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

    updateTime(); // initial
    const ticker = setInterval(updateTime, 10000);
    return () => clearInterval(ticker);
  }, []);

  const openNow = isRestaurantOpen(status, { isOpen: operatingHours.isOpen });

  /**
   * Closes the restaurant completely, ignoring operating hours.
   */
  const manuallyClose = (message: string) => {
    const nextStatus = utilManuallyClose(message);
    setStatus(nextStatus);
  };

  /**
   * Opens the restaurant. Pass `false` to keep manual control open indefinitely. 
   * Pass `true` to revoke all manual overrides and return to the normal operating schedule.
   */
  const manuallyOpen = (returnToSchedule: boolean) => {
    let nextStatus;
    if (returnToSchedule) {
      nextStatus = utilReturnToSchedule();
    } else {
      nextStatus = utilManuallyOpen();
    }
    setStatus(nextStatus);
  };

  return {
    /** True if restaurant is taking orders. */
    isOpen: openNow,
    /** True if admin has manually set status. */
    isManualOverride: status.manualOverride,
    /** Custom closed message. */
    closedMessage: status.closedMessage,
    /** Force close. */
    manuallyClose,
    /** Open manually or restore normal operating hours logic. */
    manuallyOpen,
    /** Current time string rounded to nearest minute (e.g. 3:45 PM IST). */
    currentTimeIST,
  };
}
