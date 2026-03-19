"use client";

export type RestaurantStatus = {
  manualOverride: boolean;
  isOpen: boolean;
  closedMessage: string;
};

export type OperatingHours = {
  isOpen: boolean;
};

const STORAGE_KEY = "fj_restaurant_status";

const DEFAULT_STATUS: RestaurantStatus = {
  manualOverride: false,
  isOpen: true,
  closedMessage: "We are currently closed. We will be back soon!",
};

/**
 * Returns the current RestaurantStatus from localStorage.
 */
export function getRestaurantStatus(): RestaurantStatus {
  if (typeof window === "undefined") {
    return DEFAULT_STATUS;
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as RestaurantStatus;
    }
  } catch (e) {
    console.warn("Failed to parse restaurant status from localStorage", e);
  }
  
  return DEFAULT_STATUS;
}

/**
 * Saves RestaurantStatus to localStorage.
 */
export function saveRestaurantStatus(status: RestaurantStatus): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    window.dispatchEvent(new Event("fj_status_changed"));
  } catch (e) {
    console.error("Failed to save restaurant status to localStorage", e);
  }
}

/**
 * Returns true if restaurant is currently open.
 * Respects manual override and operating hours.
 */
export function isRestaurantOpen(
  status: RestaurantStatus,
  operatingHours: OperatingHours
): boolean {
  if (status.manualOverride) {
    return status.isOpen;
  }
  return operatingHours.isOpen;
}

/**
 * Manually closes the restaurant with a custom message.
 */
export function manuallyClose(message: string): RestaurantStatus {
  const status = getRestaurantStatus();
  const nextStatus: RestaurantStatus = {
    ...status,
    manualOverride: true,
    isOpen: false,
    closedMessage: message,
  };
  saveRestaurantStatus(nextStatus);
  return nextStatus;
}

/**
 * Manually opens the restaurant.
 */
export function manuallyOpen(): RestaurantStatus {
  const status = getRestaurantStatus();
  const nextStatus: RestaurantStatus = {
    ...status,
    manualOverride: true,
    isOpen: true,
  };
  saveRestaurantStatus(nextStatus);
  return nextStatus;
}

/**
 * Returns control to automatic operating hours schedule.
 */
export function returnToSchedule(): RestaurantStatus {
  const status = getRestaurantStatus();
  const nextStatus: RestaurantStatus = {
    ...status,
    manualOverride: false,
  };
  saveRestaurantStatus(nextStatus);
  return nextStatus;
}
