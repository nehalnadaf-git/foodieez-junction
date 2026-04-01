"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import { STORAGE_KEYS } from "@/lib/app-config";
import {
  isExpired,
  loadFromStorage,
  removeFromStorage,
  saveToStorage,
} from "@/utils/storage";
import type { MenuItem, OfferType } from "@/data/menuData";
import { getPricingForItem } from "@/utils/offer";

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  category: string;
  size: "small" | "large" | "single";
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  billedQuantity: number;
  offerType: OfferType;
  offerPercentage?: number;
  offerLabel: string;
  itemTotal: number;
  savings: number;
  image?: string;
  isVeg: boolean;
  item: MenuItem;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, size: "small" | "large" | "single") => void;
  removeItem: (itemId: string, size: string) => void;
  updateQuantity: (itemId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  totalSavings: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  justAdded: boolean;
  maxQuantityPerItem: number;
  minimumOrderValue: number;
  remainingForMinimum: number;
  meetsMinimumOrder: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};

export const getBasePrice = (
  item: MenuItem,
  size: "small" | "large" | "single"
) => {
  if (size === "small" && item.priceSmall) {
    return Math.round(item.priceSmall);
  }

  if (size === "large" && item.priceLarge) {
    return Math.round(item.priceLarge);
  }

  return Math.round(item.price ?? item.priceSmall ?? item.priceLarge ?? 0);
};

export const getItemPrice = (
  item: MenuItem,
  size: "small" | "large" | "single"
) => {
  const basePrice = getBasePrice(item, size);
  return getPricingForItem(item, basePrice, 1).finalPrice;
};

function toCartItem(
  item: MenuItem,
  size: "small" | "large" | "single",
  quantity: number
): CartItem {
  const basePrice = getBasePrice(item, size);
  const pricing = getPricingForItem(item, basePrice, quantity);

  return {
    id: `${item.id}-${size}`,
    itemId: item.id,
    name: item.name,
    category: item.category,
    size,
    originalPrice: pricing.originalPrice,
    finalPrice: pricing.finalPrice,
    quantity: pricing.quantity,
    billedQuantity: pricing.billedQuantity,
    offerType: pricing.offerType,
    offerPercentage: pricing.offerPercentage,
    offerLabel: pricing.offerLabel,
    itemTotal: pricing.itemTotal,
    savings: pricing.savings,
    image: item.image,
    isVeg: item.isVeg,
    item,
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useAppSettings();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const maxQuantityPerItem = settings.order.maxQuantityPerItem;
  const minimumOrderValue = settings.order.minimumOrderValue;

  useEffect(() => {
    const persisted = loadFromStorage<{ items: unknown[]; updatedAt: number } | null>(
      STORAGE_KEYS.cart,
      null
    );

    if (!persisted) {
      setIsHydrated(true);
      return;
    }

    const ttlMs = 2 * 60 * 60 * 1000;
    if (isExpired(persisted.updatedAt, ttlMs)) {
      removeFromStorage(STORAGE_KEYS.cart);
      setIsHydrated(true);
      return;
    }

    if (Array.isArray(persisted.items) && persisted.items.length > 0) {
      const restored = persisted.items.filter((entry): entry is CartItem => {
        if (!entry || typeof entry !== "object") {
          return false;
        }

        const e = entry as Partial<CartItem>;
        return (
          typeof e.id === "string" &&
          typeof e.itemId === "string" &&
          typeof e.name === "string" &&
          typeof e.quantity === "number" &&
          typeof e.billedQuantity === "number" &&
          typeof e.itemTotal === "number" &&
          typeof e.finalPrice === "number" &&
          typeof e.originalPrice === "number" &&
          e.item !== undefined
        );
      });

      if (restored.length > 0) {
        setItems(restored);
        toast.success("Cart restored", {
          style: {
            width: "fit-content",
            minWidth: "120px",
            padding: "8px 12px",
          },
        });
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveToStorage(STORAGE_KEYS.cart, {
      items,
      updatedAt: Date.now(),
    });
  }, [items, isHydrated]);

  const addItem = useCallback(
    (item: MenuItem, size: "small" | "large" | "single") => {
      setItems((prev) => {
        const existing = prev.find((ci) => ci.itemId === item.id && ci.size === size);
        const isBogo = item.offerType === "bogo";

        if (existing) {
          const nextQuantity = existing.quantity + (isBogo ? 2 : 1);
          if (nextQuantity > maxQuantityPerItem) {
            toast.error(`Maximum ${maxQuantityPerItem} of this item allowed per order`);
            return prev;
          }

          return prev.map((ci) =>
            ci.itemId === item.id && ci.size === size
              ? toCartItem(item, size, nextQuantity)
              : ci
          );
        }

        const initialQuantity = isBogo ? 2 : 1;
        return [...prev, toCartItem(item, size, initialQuantity)];
      });

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 500);
    },
    [maxQuantityPerItem]
  );

  const removeItem = useCallback((itemId: string, size: string) => {
    setItems((prev) =>
      prev.filter((ci) => !(ci.itemId === itemId && ci.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, size: string, qty: number) => {
      setItems((prev) => {
        const target = prev.find((ci) => ci.itemId === itemId && ci.size === size);

        if (!target) {
          return prev;
        }

        if (target.offerType === "bogo") {
          if (qty <= 1) {
            return prev.filter((ci) => !(ci.itemId === itemId && ci.size === size));
          }

          const changingUp = qty > target.quantity;
          let nextQty = changingUp ? target.quantity + 2 : target.quantity - 2;

          if (nextQty < 2) {
            return prev.filter((ci) => !(ci.itemId === itemId && ci.size === size));
          }

          if (nextQty > maxQuantityPerItem) {
            toast.error(`Maximum ${maxQuantityPerItem} of this item allowed per order`);
            nextQty = target.quantity;
          }

          return prev.map((ci) =>
            ci.itemId === itemId && ci.size === size
              ? toCartItem(ci.item, ci.size, nextQty)
              : ci
          );
        }

        if (qty <= 0) {
          return prev.filter((ci) => !(ci.itemId === itemId && ci.size === size));
        }

        if (qty > maxQuantityPerItem) {
          toast.error(`Maximum ${maxQuantityPerItem} of this item allowed per order`);
          return prev;
        }

        return prev.map((ci) =>
          ci.itemId === itemId && ci.size === size
            ? toCartItem(ci.item, ci.size, qty)
            : ci
        );
      });
    },
    [maxQuantityPerItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    removeFromStorage(STORAGE_KEYS.cart);
  }, []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = Math.round(
    items.reduce((sum, ci) => sum + ci.originalPrice * ci.quantity, 0)
  );
  const totalSavings = Math.round(items.reduce((sum, ci) => sum + ci.savings, 0));
  const grandTotal = Math.round(items.reduce((sum, ci) => sum + ci.itemTotal, 0));
  const totalPrice = grandTotal;

  const remainingForMinimum =
    minimumOrderValue > 0
      ? Math.max(0, minimumOrderValue - grandTotal)
      : 0;
  const meetsMinimumOrder = minimumOrderValue === 0 || grandTotal >= minimumOrderValue;


  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        subtotal,
        totalSavings,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        justAdded,
        maxQuantityPerItem,
        minimumOrderValue,
        remainingForMinimum,
        meetsMinimumOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
