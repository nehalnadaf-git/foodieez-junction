"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  categories as defaultCategories,
  menuItems as defaultMenuItems,
  type Category,
  type MenuItem,
} from "@/data/menuData";
import { normalizeMenuItemOffer } from "@/utils/offerCompat";

interface MenuCatalogState {
  categories: Category[];
  menuItems: MenuItem[];
}

export function useMenuCatalog(): MenuCatalogState {
  const catalog = useQuery(api.menu.getCatalog);

  // If loading, or if the database is empty, fallback to the default static data
  if (catalog === undefined || (catalog.categories.length === 0 && catalog.items.length === 0)) {
    return {
      categories: defaultCategories,
      menuItems: defaultMenuItems,
    };
  }

  return {
    categories: catalog.categories as Category[],
    menuItems: (catalog.items as Array<MenuItem & { offer?: any }>).map(normalizeMenuItemOffer),
  };
}
