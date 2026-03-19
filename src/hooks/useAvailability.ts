"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type MenuItem } from "@/data/menuData";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import {
  getAvailableCount,
  getUnavailableCount,
  getAvailabilityPercentage,
  markAllAvailable,
  markAllUnavailable,
  markCategoryAvailable,
  markCategoryUnavailable,
  toggleItemAvailability,
  saveAvailability,
  groupItemsByCategory,
} from "@/utils/availability";

export interface UseAvailabilityResult {
  /** The initially loaded or synced list of items */
  items: MenuItem[];
  /** Items grouped by their category id */
  groupedItems: Record<string, MenuItem[]>;
  /** The list of items currently being modified in memory */
  stagedItems: MenuItem[];
  /** Flag indicating if stagedItems differs from persisted items */
  hasUnsavedChanges: boolean;
  /** Count of available items based on staged items */
  availableCount: number;
  /** Count of unavailable items based on staged items */
  unavailableCount: number;
  /** Total count of items */
  totalCount: number;
  /** Percentage of available items */
  availabilityPercentage: number;
  /** Current search query string */
  searchQuery: string;
  /** Function to update the search query */
  setSearchQuery: (query: string) => void;
  /** Grouped items, filtered by the current search query */
  filteredGroupedItems: Record<string, MenuItem[]>;
  /** Function to toggle an item's availability by ID */
  toggleItem: (id: string) => void;
  /** Function to mark all items as available */
  selectAll: () => void;
  /** Function to mark all items as unavailable */
  deselectAll: () => void;
  /** Function to mark all items in a category as available */
  selectCategory: (category: string) => void;
  /** Function to mark all items in a category as unavailable */
  deselectCategory: (category: string) => void;
  /** Function to persist staged changes to localStorage */
  saveChanges: () => void;
  /** Function to discard staged changes and sync with localStorage */
  discardChanges: () => void;
}

/**
 * Custom hook to manage the menu availability logic for the admin dashboard.
 *
 * @returns Object containing state, derivations, and actions for availability.
 */
export function useAvailability(): UseAvailabilityResult {
  const { menuItems: baseMenuItems } = useMenuCatalog();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stagedItems, setStagedItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load from localStorage on mount and sync
  useEffect(() => {
    if (baseMenuItems.length === 0) return;

    try {
      const persistedStr = localStorage.getItem("fj_menu_items");
      let currentItems = [...baseMenuItems];

      if (persistedStr) {
        const persistedMap: Record<string, boolean> = JSON.parse(persistedStr);
        currentItems = currentItems.map((item) => ({
          ...item,
          available: persistedMap[item.id] ?? item.available ?? true,
        }));
      } else {
        // Initialize if not present
        const map = currentItems.reduce((acc, item) => {
          acc[item.id] = item.available !== false;
          return acc;
        }, {} as Record<string, boolean>);
        localStorage.setItem("fj_menu_items", JSON.stringify(map));
      }

      setItems(currentItems);
      setStagedItems(currentItems);
    } catch (e) {
      console.error("Local storage error", e);
      setItems(baseMenuItems);
      setStagedItems(baseMenuItems);
    }
  }, [baseMenuItems]);

  // Derived properties based on staged items
  const availableCount = getAvailableCount(stagedItems);
  const unavailableCount = getUnavailableCount(stagedItems);
  const totalCount = stagedItems.length;
  const availabilityPercentage = getAvailabilityPercentage(stagedItems);

  // Check if staged is different from items
  const hasUnsavedChanges = useMemo(() => {
    if (items.length !== stagedItems.length) return false;
    return items.some((item, index) => item.available !== stagedItems[index].available);
  }, [items, stagedItems]);

  const groupedItems = useMemo(() => groupItemsByCategory(items), [items]);

  const filteredGroupedItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupItemsByCategory(stagedItems);
    }
    const query = searchQuery.toLowerCase();
    const filtered = stagedItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
    return groupItemsByCategory(filtered);
  }, [stagedItems, searchQuery]);

  // Actions
  const toggleItem = useCallback((id: string) => {
    setStagedItems((prev) => toggleItemAvailability(prev, id));
  }, []);

  const selectAll = useCallback(() => {
    setStagedItems((prev) => markAllAvailable(prev));
  }, []);

  const deselectAll = useCallback(() => {
    setStagedItems((prev) => markAllUnavailable(prev));
  }, []);

  const selectCategory = useCallback((category: string) => {
    setStagedItems((prev) => markCategoryAvailable(prev, category));
  }, []);

  const deselectCategory = useCallback((category: string) => {
    setStagedItems((prev) => markCategoryUnavailable(prev, category));
  }, []);

  const saveChanges = useCallback(() => {
    saveAvailability(stagedItems);
    setItems([...stagedItems]);
  }, [stagedItems]);

  const discardChanges = useCallback(() => {
    setStagedItems([...items]);
  }, [items]);

  return {
    items,
    groupedItems,
    stagedItems,
    hasUnsavedChanges,
    availableCount,
    unavailableCount,
    totalCount,
    availabilityPercentage,
    searchQuery,
    setSearchQuery,
    filteredGroupedItems,
    toggleItem,
    selectAll,
    deselectAll,
    selectCategory,
    deselectCategory,
    saveChanges,
    discardChanges,
  };
}
