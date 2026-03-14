// Re-export Cart types and hooks from the providers folder
// for backwards-compatible imports within components
export { useCart, getItemPrice } from "@/providers/CartProvider";
export type { CartItem } from "@/providers/CartProvider";
