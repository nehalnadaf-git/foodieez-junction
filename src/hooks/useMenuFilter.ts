"use client";

import { useState } from "react";
import { type MenuItem, type Category } from "@/data/menuData";

export type MenuFilter = "available" | "all";

export interface UseMenuFilterResult {
  /** Current filter state, defaults to 'available' */
  filter: MenuFilter;
  /** Setter for current filter state */
  setFilter: (filter: MenuFilter) => void;
  /** Function to filter menu items array based on filter state */
  filterItems: (items: MenuItem[]) => MenuItem[];
  /** Function to filter categories based on filter state and items availability */
  filterCategories: (categories: Category[]) => Category[];
  /** The count of items that are available */
  availableCount: number;
  /** The count of all items */
  totalCount: number;
  /** The count of items that are out of stock */
  unavailableCount: number;
}

/**
 * Custom hook for managing menu availability filter logic, counts, and filtered data.
 *
 * @param allItems - Array of all MenuItems used to compute reactive counts and category availability
 * @returns Filter State, Set Filter function, filter utilities and counts
 */
export function useMenuFilter(allItems: MenuItem[]): UseMenuFilterResult {
  const [filter, setFilter] = useState<MenuFilter>("available");

  const totalCount = allItems.length;
  // Item is considered available unless explicitly set to false
  const availableCount = allItems.filter(item => item.available !== false).length;
  const unavailableCount = totalCount - availableCount;

  /**
   * Filters a given list of items based on the current filter state.
   *
   * @param items - Array of MenuItem to filter
   * @returns Filtered array of MenuItem
   */
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    if (filter === "all") return items;
    return items.filter((item) => item.available !== false);
  };

  /**
   * Filters categories to only show those with at least one available item when in "available" mode,
   * or all categories when in "all" mode.
   *
   * @param categories - Array of categories to filter
   * @returns Filtered array of Category
   */
  const filterCategories = (categories: Category[]): Category[] => {
    if (filter === "all") return categories;
    return categories.filter((category) => {
      // Find items in this category
      const categoryItems = allItems.filter((item) => item.category === category.id);
      // Category is visible if it has at least one available item
      return categoryItems.some((item) => item.available !== false);
    });
  };

  return {
    filter,
    setFilter,
    filterItems,
    filterCategories,
    availableCount,
    totalCount,
    unavailableCount,
  };
}
