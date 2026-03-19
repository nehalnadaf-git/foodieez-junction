import { type MenuItem } from "@/data/menuData";

/**
 * Returns count of available menu items
 * @param items - Array of MenuItem
 * @returns number of available items
 */
export function getAvailableCount(items: MenuItem[]): number {
  return items.filter((item) => item.available !== false).length;
}

/**
 * Returns count of out of stock menu items
 * @param items - Array of MenuItem
 * @returns number of unavailable items
 */
export function getUnavailableCount(items: MenuItem[]): number {
  return items.filter((item) => item.available === false).length;
}

/**
 * Returns percentage of available items (0-100)
 * @param items - Array of MenuItem
 * @returns percentage of items that are available
 */
export function getAvailabilityPercentage(items: MenuItem[]): number {
  if (items.length === 0) return 0;
  const available = getAvailableCount(items);
  return Math.round((available / items.length) * 100);
}

/**
 * Marks all items as available
 * @param items - Array of MenuItem
 * @returns new Array of MenuItem with available set to true
 */
export function markAllAvailable(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({ ...item, available: true }));
}

/**
 * Marks all items as out of stock
 * @param items - Array of MenuItem
 * @returns new Array of MenuItem with available set to false
 */
export function markAllUnavailable(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({ ...item, available: false }));
}

/**
 * Marks all items in a category as available
 * @param items - Array of MenuItem
 * @param category - Category ID
 * @returns new Array of MenuItem
 */
export function markCategoryAvailable(items: MenuItem[], category: string): MenuItem[] {
  return items.map((item) =>
    item.category === category ? { ...item, available: true } : item
  );
}

/**
 * Marks all items in a category as out of stock
 * @param items - Array of MenuItem
 * @param category - Category ID
 * @returns new Array of MenuItem
 */
export function markCategoryUnavailable(items: MenuItem[], category: string): MenuItem[] {
  return items.map((item) =>
    item.category === category ? { ...item, available: false } : item
  );
}

/**
 * Toggles a single item availability by id
 * @param items - Array of MenuItem
 * @param id - Item ID
 * @returns new Array of MenuItem
 */
export function toggleItemAvailability(items: MenuItem[], id: string): MenuItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, available: item.available === false ? true : false } : item
  );
}

/**
 * Saves availability changes to localStorage
 * @param items - Array of MenuItem to save
 */
export function saveAvailability(items: MenuItem[]): void {
  // We only persist the id and its availability to minimize storage
  // but to keep it simple, we store an object map of id -> boolean
  const availabilityMap = items.reduce((acc, item) => {
    acc[item.id] = item.available !== false;
    return acc;
  }, {} as Record<string, boolean>);
  
  localStorage.setItem("fj_menu_items", JSON.stringify(availabilityMap));
}

/**
 * Returns items grouped by category
 * @param items - Array of MenuItem
 * @returns Record grouping items by category
 */
export function groupItemsByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce((groups, item) => {
    const cat = item.category;
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
    return groups;
  }, {} as Record<string, MenuItem[]>);
}
