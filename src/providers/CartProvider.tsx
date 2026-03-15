"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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
import { calculateDiscountedPrice, isOfferActive } from "@/utils/offer";
import type { ItemOffer } from "@/data/menuData";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  description?: string;
  price?: number;
  priceSmall?: number;
  priceLarge?: number;
  image?: string;
  imageSource?: "upload" | "url";
  available?: boolean;
  isSpecial?: boolean;
  offer?: ItemOffer;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  size: "small" | "large" | "single";
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, size: "small" | "large" | "single") => void;
  removeItem: (itemId: string, size: string) => void;
  updateQuantity: (itemId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
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

export const getItemPrice = (
  item: MenuItem,
  size: "small" | "large" | "single"
) => {
  const basePrice =
    size === "small" && item.priceSmall
      ? item.priceSmall
      : size === "large" && item.priceLarge
        ? item.priceLarge
        : item.price || 0;

  if (!item.offer || !isOfferActive(item.offer)) {
    return basePrice;
  }

  return calculateDiscountedPrice(basePrice, item.offer);
};

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
    const persisted = loadFromStorage<{ items: CartItem[]; updatedAt: number } | null>(
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

    if (persisted.items.length > 0) {
      setItems(persisted.items);
      toast.success("Your previous cart has been restored");
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
        const existing = prev.find(
          (ci) => ci.item.id === item.id && ci.size === size
        );
        if (existing) {
          if (existing.quantity >= maxQuantityPerItem) {
            toast.error(
              `Maximum ${maxQuantityPerItem} of this item allowed per order`
            );
            return prev;
          }

          return prev.map((ci) =>
            ci.item.id === item.id && ci.size === size
              ? { ...ci, quantity: ci.quantity + 1 }
              : ci
          );
        }
        return [...prev, { item, quantity: 1, size }];
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 500);
    },
    [maxQuantityPerItem]
  );

  const removeItem = useCallback((itemId: string, size: string) => {
    setItems((prev) =>
      prev.filter((ci) => !(ci.item.id === itemId && ci.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, size: string, qty: number) => {
      if (qty <= 0) {
        removeItem(itemId, size);
        return;
      }

      if (qty > maxQuantityPerItem) {
        toast.error(`Maximum ${maxQuantityPerItem} of this item allowed per order`);
        return;
      }

      setItems((prev) =>
        prev.map((ci) =>
          ci.item.id === itemId && ci.size === size
            ? { ...ci, quantity: qty }
            : ci
        )
      );
    },
    [maxQuantityPerItem, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    removeFromStorage(STORAGE_KEYS.cart);
  }, []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalPrice = items.reduce(
    (sum, ci) => sum + getItemPrice(ci.item, ci.size) * ci.quantity,
    0
  );

  const remainingForMinimum = 0;
  const meetsMinimumOrder = true;

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
