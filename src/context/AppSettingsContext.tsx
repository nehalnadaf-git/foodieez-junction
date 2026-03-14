"use client";

import {
  DEFAULT_APP_SETTINGS,
  STORAGE_KEYS,
  type AppSettings,
} from "@/lib/app-config";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AppSettingsContextValue {
  settings: AppSettings;
  isHydrated: boolean;
  setSettings: (next: AppSettings) => void;
  patchSettings: (patch: Partial<AppSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(
  undefined
);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = loadFromStorage<AppSettings>(
      STORAGE_KEYS.appSettings,
      DEFAULT_APP_SETTINGS
    );

    setSettingsState({
      ...DEFAULT_APP_SETTINGS,
      ...stored,
      order: {
        ...DEFAULT_APP_SETTINGS.order,
        ...stored.order,
      },
      upi: {
        ...DEFAULT_APP_SETTINGS.upi,
        ...stored.upi,
      },
      restaurant: {
        ...DEFAULT_APP_SETTINGS.restaurant,
        ...stored.restaurant,
      },
      reviews: {
        ...DEFAULT_APP_SETTINGS.reviews,
        ...stored.reviews,
      },
    });
    setIsHydrated(true);
  }, []);

  const setSettings = useCallback((next: AppSettings) => {
    setSettingsState(next);
    saveToStorage(STORAGE_KEYS.appSettings, next);
  }, []);

  const patchSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next: AppSettings = {
        ...prev,
        ...patch,
        order: {
          ...prev.order,
          ...patch.order,
        },
        upi: {
          ...prev.upi,
          ...patch.upi,
        },
        restaurant: {
          ...prev.restaurant,
          ...patch.restaurant,
        },
        reviews: {
          ...prev.reviews,
          ...patch.reviews,
        },
      };

      saveToStorage(STORAGE_KEYS.appSettings, next);
      return next;
    });
  }, []);

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
