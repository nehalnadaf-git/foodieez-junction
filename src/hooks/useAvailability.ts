"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
  /** Function to persist staged changes to Convex */
  saveChanges: () => Promise<void>;
  /** Function to discard staged changes and sync with Convex data */
  discardChanges: () => void;
}

/**
 * Custom hook to manage the menu availability logic for the admin dashboard.
 *
 * @returns Object containing state, derivations, and actions for availability.
 */
export function useAvailability(): UseAvailabilityResult {
  const { menuItems: baseMenuItems } = useMenuCatalog();
  const setAvailabilityBulk = useMutation(api.menu.setAvailabilityBulk);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stagedItems, setStagedItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync local staging state from Convex-backed menu catalog
  useEffect(() => {
    if (baseMenuItems.length === 0) return;

    const currentItems = baseMenuItems.map((item) => ({
      ...item,
      available: item.available ?? true,
    }));

    setItems(currentItems);
    setStagedItems((prev) => {
      const hasUnsaved = prev.length === currentItems.length && prev.some((item, index) => item.available !== currentItems[index].available);
      return hasUnsaved ? prev : currentItems;
    });
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

  const saveChanges = useCallback(async () => {
    await setAvailabilityBulk({
      updates: stagedItems.map((item) => ({
        itemId: item.id,
        available: item.available !== false,
      })),
    });
    setItems([...stagedItems]);
  }, [setAvailabilityBulk, stagedItems]);

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
