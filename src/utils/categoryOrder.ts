import { type MenuCategory, categories as defaultCategories } from "@/data/menuData";

/**
 * Returns all categories sorted by order field ascending.
 * @param categories - Array of MenuCategory
 * @returns Sorted Array of MenuCategory
 */
export function getSortedCategories(categories: MenuCategory[]): MenuCategory[] {
  return [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
 * Resets all categories to original default order from menuData.ts.
 * Newly added categories are appended at the end.
 * @param categories - Array of MenuCategory
 * @returns Array of MenuCategory in default natural order
 */
export function resetCategoryOrder(categories: MenuCategory[]): MenuCategory[] {
  const defaultOrderMap = new Map<string, number>();
  defaultCategories.forEach((cat, index) => {
    defaultOrderMap.set(cat.id, index);
  });

  const resetArr = [...categories].sort((a, b) => {
    const aOrder = defaultOrderMap.get(a.id);
    const bOrder = defaultOrderMap.get(b.id);
    
    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    
    return a.name.localeCompare(b.name);
  });

  return reassignCategoryOrder(resetArr);
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
