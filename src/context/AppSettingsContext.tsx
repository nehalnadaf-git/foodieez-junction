"use client";

import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/lib/app-config";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AppSettingsContextValue {
  settings: AppSettings;
  isHydrated: boolean;
  setSettings: (next: AppSettings) => void;
  patchSettings: (patch: Partial<AppSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
  undefined
);

/** Convert a flat Convex key-value map into the nested AppSettings shape. */
function mapToSettings(kv: Record<string, string>): AppSettings {
  const bool = (key: string, def: boolean) =>
    key in kv ? kv[key] === "true" : def;
  const str = (key: string, def: string) => kv[key] ?? def;
  const num = (key: string, def: number) =>
    key in kv ? Number(kv[key]) : def;

  const d = DEFAULT_APP_SETTINGS;
  return {
    order: {
      dineInWhatsappNumber: str("order.dineInWhatsappNumber", d.order.dineInWhatsappNumber),
      takeawayWhatsappNumber: str("order.takeawayWhatsappNumber", d.order.takeawayWhatsappNumber),
      openTimeIst: str("order.openTimeIst", d.order.openTimeIst),
      closeTimeIst: str("order.closeTimeIst", d.order.closeTimeIst),
      estimatedWaitTime: str("order.estimatedWaitTime", d.order.estimatedWaitTime),
      orderIdPrefix: str("order.orderIdPrefix", d.order.orderIdPrefix),
      minimumOrderValue: num("order.minimumOrderValue", d.order.minimumOrderValue),
      maxQuantityPerItem: num("order.maxQuantityPerItem", d.order.maxQuantityPerItem),
      dineInEnabled: bool("order.dineInEnabled", d.order.dineInEnabled),
    },
    upi: {
      upiId: str("upi.upiId", d.upi.upiId),
      enableCash: bool("upi.enableCash", d.upi.enableCash),
      enableUpi: bool("upi.enableUpi", d.upi.enableUpi),
    },
    restaurant: {
      restaurantName: str("restaurant.restaurantName", d.restaurant.restaurantName),
      restaurantAddress: str("restaurant.restaurantAddress", d.restaurant.restaurantAddress),
      googleMapsLink: str("restaurant.googleMapsLink", d.restaurant.googleMapsLink),
      googleReviewLink: str("restaurant.googleReviewLink", d.restaurant.googleReviewLink),
      baseDomain: str("restaurant.baseDomain", d.restaurant.baseDomain),
      currencySymbol: str("restaurant.currencySymbol", d.restaurant.currencySymbol),
      maintenanceMode: bool("restaurant.maintenanceMode", d.restaurant.maintenanceMode),
    },
    reviews: {
      showReviewsOnHome: bool("reviews.showReviewsOnHome", d.reviews.showReviewsOnHome),
    },
    delivery: {
      deliveryEnabled: bool("delivery.deliveryEnabled", d.delivery.deliveryEnabled),
      deliveryCharge: num("delivery.deliveryCharge", d.delivery.deliveryCharge),
      deliveryMinimumOrder: num("delivery.deliveryMinimumOrder", d.delivery.deliveryMinimumOrder),
      deliveryAreaDescription: str("delivery.deliveryAreaDescription", d.delivery.deliveryAreaDescription),
      deliveryMaxDistance: str("delivery.deliveryMaxDistance", d.delivery.deliveryMaxDistance),
      deliveryEstimatedTime: str("delivery.deliveryEstimatedTime", d.delivery.deliveryEstimatedTime),
      deliveryAvailableAreas: str("delivery.deliveryAvailableAreas", d.delivery.deliveryAvailableAreas),
      deliveryInstructions: str("delivery.deliveryInstructions", d.delivery.deliveryInstructions),
      deliveryWhatsappNumber: str("delivery.deliveryWhatsappNumber", d.delivery.deliveryWhatsappNumber),
    },
  };
}

/** Convert a nested AppSettings patch into a flat array of {key, value} pairs. */
function settingsToPairs(patch: Partial<AppSettings>): { key: string; value: string }[] {
  const pairs: { key: string; value: string }[] = [];
  const add = (key: string, value: unknown) =>
    pairs.push({ key, value: String(value) });

  if (patch.order) {
    for (const [k, v] of Object.entries(patch.order)) {
      add(`order.${k}`, v);
    }
  }
  if (patch.upi) {
    for (const [k, v] of Object.entries(patch.upi)) {
      add(`upi.${k}`, v);
    }
  }
  if (patch.restaurant) {
    for (const [k, v] of Object.entries(patch.restaurant)) {
      add(`restaurant.${k}`, v);
    }
  }
  if (patch.reviews) {
    for (const [k, v] of Object.entries(patch.reviews)) {
      add(`reviews.${k}`, v);
    }
  }
  if (patch.delivery) {
    for (const [k, v] of Object.entries(patch.delivery)) {
      add(`delivery.${k}`, v);
    }
  }
  return pairs;
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const rawSettings = useQuery(api.appSettings.getAll);
  const setManyMutation = useMutation(api.appSettings.setMany);

  const isHydrated = rawSettings !== undefined;
  const settings = useMemo(
    () => (rawSettings ? mapToSettings(rawSettings) : DEFAULT_APP_SETTINGS),
    [rawSettings]
  );

  const setSettings = useCallback(
    (next: AppSettings) => {
      setManyMutation({ settings: settingsToPairs(next) });
    },
    [setManyMutation]
  );

  const patchSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setManyMutation({ settings: settingsToPairs(patch) });
    },
    [setManyMutation]
  );

  const value = useMemo<AppSettingsContextValue>(
    () => ({ settings, isHydrated, setSettings, patchSettings }),
    [settings, isHydrated, setSettings, patchSettings]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }
  return context;
}
