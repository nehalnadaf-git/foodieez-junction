"use client";

import { useState, useEffect, useCallback } from "react";
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from "@/utils/storage";
import { STORAGE_KEYS } from "@/lib/app-config";
import type { CartItem } from "@/context/CartContext";
import { generateOrderToken } from "@/utils/order";

// ─── Session duration ─────────────────────────────────────────────────────────
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayAtLastItemRecord {
  name: string;
  size: "small" | "large" | "single";
  quantity: number;
  billedQuantity: number;
  offerType: string;
  offerLabel: string;
  offerPercentage?: number;
  finalPrice: number;
  itemTotal: number;
  savings: number;
}

export interface PayAtLastOrder {
  orderNumber: number;
  timestamp: number;
  items: PayAtLastItemRecord[];
  orderTotal: number;
  orderSubtotal: number;
  orderSavings: number;
  specialInstructions: string;
}

export interface DineSession {
  orderId: string;
  tableNumber: string;
  customerName: string;
  orderType: "dine-in";
  sessionStart: number;
  sessionExpiry: number;
  isPayAtLastActive: boolean;
  totalOrdersCount: number;
  runningTotal: number;
  runningSubtotal: number;
  runningSavings: number;
  orders: PayAtLastOrder[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function cartItemsToRecords(cartItems: CartItem[]): PayAtLastItemRecord[] {
  return cartItems.map((ci) => ({
    name: ci.name,
    size: ci.size,
    quantity: ci.quantity,
    billedQuantity: ci.billedQuantity,
    offerType: ci.offerType,
    offerLabel: ci.offerLabel,
    offerPercentage: ci.offerPercentage,
    finalPrice: ci.finalPrice,
    itemTotal: ci.itemTotal,
    savings: ci.savings,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePayAtLast() {
  const [session, setSession] = useState<DineSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load + validate session from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage<DineSession | null>(
      STORAGE_KEYS.djSession,
      null
    );
    if (stored) {
      if (Date.now() > stored.sessionExpiry) {
        // Session has expired — remove it silently
        removeFromStorage(STORAGE_KEYS.djSession);
        setSession(null);
      } else {
        setSession(stored);
      }
    }
    setIsHydrated(true);
  }, []);

  // ── Write helpers ────────────────────────────────────────────────────────────

  const persist = useCallback((s: DineSession) => {
    saveToStorage(STORAGE_KEYS.djSession, s);
    setSession(s);
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Creates a new session. Call ONCE at the beginning of a dine-in visit.
   * Returns the newly created session so you can consume orderId etc. immediately.
   */
  const initSession = useCallback(
    (customerName: string, tableNumber: string, orderIdPrefix: string): DineSession => {
      const now = Date.now();
      const newSession: DineSession = {
        orderId: generateOrderToken(orderIdPrefix),
        tableNumber,
        customerName,
        orderType: "dine-in",
        sessionStart: now,
        sessionExpiry: now + SESSION_TTL_MS,
        isPayAtLastActive: false,
        totalOrdersCount: 0,
        runningTotal: 0,
        runningSubtotal: 0,
        runningSavings: 0,
        orders: [],
      };
      persist(newSession);
      return newSession;
    },
    [persist]
  );

  /**
   * Appends the current cart to the session as a new Pay at Last order.
   * Updates running totals. Returns the new order number.
   */
  const addOrderToSession = useCallback(
    (
      cartItems: CartItem[],
      specialInstructions: string,
      orderSubtotal: number,
      orderSavings: number,
      orderTotal: number
    ): number => {
      let newOrderNumber = 1;
      setSession((prev) => {
        if (!prev) return prev;
        newOrderNumber = prev.totalOrdersCount + 1;
        const newOrder: PayAtLastOrder = {
          orderNumber: newOrderNumber,
          timestamp: Date.now(),
          items: cartItemsToRecords(cartItems),
          orderTotal,
          orderSubtotal,
          orderSavings,
          specialInstructions,
        };
        const updated: DineSession = {
          ...prev,
          isPayAtLastActive: true,
          totalOrdersCount: newOrderNumber,
          runningTotal: prev.runningTotal + orderTotal,
          runningSubtotal: prev.runningSubtotal + orderSubtotal,
          runningSavings: prev.runningSavings + orderSavings,
          orders: [...prev.orders, newOrder],
        };
        saveToStorage(STORAGE_KEYS.djSession, updated);
        return updated;
      });
      return newOrderNumber;
    },
    []
  );

  /**
   * Wipes the session from state and localStorage.
   * Called after final Pay Now (consolidated bill).
   */
  const clearSession = useCallback(() => {
    removeFromStorage(STORAGE_KEYS.djSession);
    setSession(null);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────────

  const hasSession = session !== null;
  const hasActiveOrders = (session?.orders?.length ?? 0) > 0;
  const isSessionExpired =
    session !== null && Date.now() > session.sessionExpiry;

  const minutesUntilExpiry = session
    ? Math.max(
        0,
        Math.floor((session.sessionExpiry - Date.now()) / 1000 / 60)
      )
    : 0;

  return {
    session,
    isHydrated,
    hasSession,
    hasActiveOrders,
    isSessionExpired,
    minutesUntilExpiry,
    initSession,
    addOrderToSession,
    clearSession,
  };
}
