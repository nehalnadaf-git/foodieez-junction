"use client";

import { STORAGE_KEYS } from "@/lib/app-config";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface TableContextValue {
  tableNumber: string | null;
  scannedTableNumber: string | null;
  isTableBannerDismissed: boolean;
  dismissTableBanner: () => void;
  resetTableBanner: () => void;
  syncScannedTableNumber: (value: string | null) => void;
}

const TableContext = createContext<TableContextValue | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const [isTableBannerDismissed, setIsTableBannerDismissed] = useState(false);
  const [scannedTableNumber, setScannedTableNumber] = useState<string | null>(
    null
  );

  const syncScannedTableNumber = useCallback((value: string | null) => {
    if (value && value.trim().length > 0) {
      setScannedTableNumber(value.trim());
      return;
    }

    setScannedTableNumber(null);
  }, []);

  useEffect(() => {
    const dismissed = loadFromStorage<boolean>(
      STORAGE_KEYS.tableBannerDismissed,
      false
    );
    setIsTableBannerDismissed(dismissed);
  }, []);

  useEffect(() => {
    if (scannedTableNumber) {
      setIsTableBannerDismissed(false);
      saveToStorage(STORAGE_KEYS.tableBannerDismissed, false);
    }
  }, [scannedTableNumber]);

  const value = useMemo<TableContextValue>(
    () => ({
      tableNumber: scannedTableNumber,
      scannedTableNumber,
      isTableBannerDismissed,
      syncScannedTableNumber,
      dismissTableBanner: () => {
        setIsTableBannerDismissed(true);
        saveToStorage(STORAGE_KEYS.tableBannerDismissed, true);
      },
      resetTableBanner: () => {
        setIsTableBannerDismissed(false);
        saveToStorage(STORAGE_KEYS.tableBannerDismissed, false);
      },
    }),
    [scannedTableNumber, isTableBannerDismissed, syncScannedTableNumber]
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used inside TableProvider");
  }

  return context;
}
