"use client";

import { useCart } from "@/context/CartContext";

export function useCartState() {
  return useCart();
}
