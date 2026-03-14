import {
  STORAGE_KEYS,
} from "@/lib/app-config";
import {
  categories as defaultCategories,
  menuItems as defaultMenuItems,
  type Category,
  type ItemOffer,
  type MenuItem,
} from "@/data/menuData";
import { loadFromStorage, saveToStorage } from "@/utils/storage";
import { isOfferActive } from "@/utils/offer";

export interface MenuCatalog {
  categories: Category[];
  items: MenuItem[];
}

export const MENU_CATALOG_UPDATED_EVENT = "fj-menu-catalog-updated";

function sanitizeCategory(category: Category): Category {
  return {
    id: category.id,
    name: category.name,
    image: category.image,
  };
}

function sanitizeMenuItem(item: MenuItem): MenuItem {
  let normalizedOffer: ItemOffer | undefined;

  if (item.offer) {
    const offer = item.offer;
    normalizedOffer = {
      type: offer.type,
      value: offer.value,
      customText: offer.customText?.trim() || undefined,
      active: offer.active,
      expiresAt: offer.expiresAt,
    };

    if (normalizedOffer.active && !isOfferActive(normalizedOffer)) {
      normalizedOffer.active = false;
    }
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    isVeg: item.isVeg,
    description: item.description?.trim() || undefined,
    sizes: item.sizes,
    available: item.available ?? true,
    isSpecial: item.isSpecial ?? false,
    offer: normalizedOffer,
    price: item.price,
    priceSmall: item.priceSmall,
    priceLarge: item.priceLarge,
    image: item.image,
    imageSource: item.imageSource,
    imageScale: item.imageScale,
  };
}

function fallbackCatalog(): MenuCatalog {
  return {
    categories: defaultCategories.map(sanitizeCategory),
    items: defaultMenuItems.map(sanitizeMenuItem),
  };
}

function normalizeCatalog(input: MenuCatalog): MenuCatalog {
  const categories = input.categories
    .filter((category) => category.id && category.name && category.image)
    .map(sanitizeCategory);

  const validCategoryIds = new Set(categories.map((category) => category.id));
  const items = input.items
    .filter((item) => item.id && item.name && validCategoryIds.has(item.category))
    .map(sanitizeMenuItem);

  if (categories.length === 0 || items.length === 0) {
    return fallbackCatalog();
  }

  return { categories, items };
}

export function loadMenuCatalog(): MenuCatalog {
  const fallback = fallbackCatalog();
  const stored = loadFromStorage<MenuCatalog>(STORAGE_KEYS.menuOverrides, fallback);
  return normalizeCatalog(stored);
}

export function saveMenuCatalog(catalog: MenuCatalog): void {
  saveToStorage(STORAGE_KEYS.menuOverrides, normalizeCatalog(catalog));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MENU_CATALOG_UPDATED_EVENT));
  }
}
