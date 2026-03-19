import { type MenuCategory } from "@/data/menuData";

const STORAGE_KEY = "fj_menu_categories";

interface CategoryStoredState {
  order: number;
  visible: boolean;
}

/**
 * Syncs the provided categories with localStorage.
 * If a category isn't in localStorage, it's assigned the next available order number and defaults to visible.
 */
function syncWithStorage(categories: MenuCategory[]): MenuCategory[] {
  if (typeof window === "undefined") return categories;

  let storedObject: Record<string, CategoryStoredState> = {};
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      storedObject = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to parse category order from localStorage", e);
  }

  // Find the highest existing order number to append new categories
  let maxOrder = -1;
  const usedOrders = new Set<number>();
  
  for (const val of Object.values(storedObject)) {
    if (typeof val.order === "number") {
      usedOrders.add(val.order);
      if (val.order > maxOrder) {
        maxOrder = val.order;
      }
    }
  }

  const syncedArray: MenuCategory[] = [];
  let needsSave = false;
  
  // Create synced list
  categories.forEach((cat) => {
    const stored = storedObject[cat.id];
    
    if (stored) {
      syncedArray.push({
        ...cat,
        order: stored.order,
        visible: stored.visible !== false,
      });
    } else {
      // It's a brand new category (or missing from storage)
      maxOrder += 1;
      syncedArray.push({
        ...cat,
        order: maxOrder,
        visible: cat.visible !== false,
      });
      storedObject[cat.id] = { order: maxOrder, visible: cat.visible !== false };
      needsSave = true;
    }
  });

  // If there were new categories, save them back to storage immediately
  if (needsSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedObject));
    } catch {}
  }

  return syncedArray;
}

/**
 * Returns all categories sorted by order field ascending.
 * This function also handles merging with localStorage.
 * @param categories - Array of MenuCategory
 * @returns Sorted Array of MenuCategory
 */
export function getSortedCategories(categories: MenuCategory[]): MenuCategory[] {
  const synced = syncWithStorage(categories);
  return synced.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Reassigns order values (0, 1, 2...) after a drag and drop
 * using their new array index positions.
 * @param categories - Array of MenuCategory that are already in the new visual order
 * @returns Array of MenuCategory with updated order numbers
 */
export function reassignCategoryOrder(categories: MenuCategory[]): MenuCategory[] {
  return categories.map((cat, index) => ({
    ...cat,
    order: index,
  }));
}

/**
 * Resets all categories to default alphabetical order
 * and reassigns order values accordingly (0, 1, 2...)
 * @param categories - Array of MenuCategory
 * @returns Array of MenuCategory in default alphabetical order
 */
export function resetCategoryOrder(categories: MenuCategory[]): MenuCategory[] {
  const alphabetical = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  return reassignCategoryOrder(alphabetical);
}

/**
 * Persists completely updated category order to localStorage.
 * Usually called after `reassignCategoryOrder` or toggling visibility.
 * @param categories - Array of MenuCategory containing the latest state
 */
export function saveCategoryOrder(categories: MenuCategory[]): void {
  if (typeof window === "undefined") return;

  const storedObject: Record<string, CategoryStoredState> = {};
  
  categories.forEach((cat) => {
    storedObject[cat.id] = {
      order: cat.order ?? 0,
      visible: cat.visible !== false,
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedObject));
  } catch (e) {
    console.error("Failed to save category order to localStorage", e);
  }
}

/**
 * Returns only visible categories sorted by their assigned order field.
 * Used by the customer facing menu to hide specific sections.
 * @param categories - Array of MenuCategory
 * @returns Filtered and sorted Array of MenuCategory
 */
export function getVisibleSortedCategories(categories: MenuCategory[]): MenuCategory[] {
  const sorted = getSortedCategories(categories);
  return sorted.filter((cat) => cat.visible !== false);
}

/**
 * Reassigns order values after a category is deleted to fill any gaps
 * @param categories - Array of remaining MenuCategory objects
 * @returns Array of MenuCategory with normalized order numbers
 */
export function reorderAfterDelete(categories: MenuCategory[]): MenuCategory[] {
  const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return reassignCategoryOrder(sorted);
}

/**
 * Persists updated categories to localStorage
 * @param categories - Array of MenuCategory
 */
export function saveCategories(categories: MenuCategory[]): void {
  saveCategoryOrder(categories);
}
