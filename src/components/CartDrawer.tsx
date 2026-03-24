"use client";

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import { useAppSettings } from "@/context/AppSettingsContext";

const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    totalSavings,
    grandTotal,
    totalItems,
    maxQuantityPerItem,
    minimumOrderValue,
    remainingForMinimum,
    meetsMinimumOrder,
    clearCart,
  } = useCart();
  const { isOpen } = useRestaurantStatus();
  const { settings } = useAppSettings();
  const canPlaceOrder = totalItems > 0 && isOpen;

  // Body scroll lock
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[75] flex flex-col"
            style={{
              background: "hsl(var(--background) / 0.98)",
              borderLeft: "1px solid hsl(var(--primary) / 0.12)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid hsl(var(--primary) / 0.10)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(var(--primary) / 0.12)" }}
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground leading-tight">
                    Your Order
                  </h2>
                  {totalItems > 0 && (
                    <p className="text-xs text-muted-foreground font-medium">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
              </div>
            {/* Clear All button — only when cart has items */}
            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            </div>

            {/* ── Items List ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center h-full text-center gap-5 pb-10">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "hsl(var(--primary) / 0.07)" }}
                  >
                    <ShoppingBag className="w-9 h-9 text-muted-foreground/30" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-display font-bold text-foreground">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add something delicious from the menu
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-primary"
                    style={{
                      border: "1.5px solid hsl(var(--primary) / 0.4)",
                      background: "hsl(var(--primary) / 0.08)",
                    }}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((ci) => {
                    const isVeg = ci.isVeg;
                    return (
                      <motion.div
                        key={ci.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-2xl px-4 py-4 space-y-4"
                        style={{
                          background: "hsl(var(--foreground) / 0.03)",
                          border: "1px solid hsl(var(--foreground) / 0.07)",
                        }}
                      >
                        {/* Top Row: Name and Remove */}
                        <div className="flex items-start gap-3">
                          {/* Veg Indicator */}
                          <div className="flex-shrink-0 pt-1">
                            <div
                              className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                              style={{
                                border: `1.2px solid ${isVeg ? "#22c55e" : "#ef4444"}`,
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  background: isVeg ? "#22c55e" : "#ef4444",
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-foreground leading-snug">
                              {ci.name}
                            </p>
                            {ci.size !== "single" && (
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                {ci.size === "small" ? "Small Portion" : "Large Portion"}
                              </p>
                            )}
                            {ci.offerType !== "none" && (
                              <p className="mt-1 text-xs font-semibold text-primary">{ci.offerLabel}</p>
                            )}
                            {ci.offerType === "percentage" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                <span className="line-through mr-1">Rs.{ci.originalPrice}</span>
                                <span>Rs.{ci.finalPrice}</span>
                              </p>
                            )}
                            {ci.offerType === "bogo" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Qty: {ci.quantity} (Billed: {ci.billedQuantity})
                              </p>
                            )}
                            {ci.savings > 0 && (
                              <p className="mt-1 text-xs font-semibold text-emerald-400">You save Rs.{ci.savings}</p>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(ci.itemId, ci.size)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Bottom Row: Controls and Price */}
                        <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                          <div
                            className="flex items-center gap-1 rounded-full p-0.5"
                            style={{
                              background: "hsl(var(--foreground) / 0.05)",
                              border: "1px solid hsl(var(--foreground) / 0.07)",
                            }}
                          >
                            <button
                              onClick={() =>
                                updateQuantity(ci.itemId, ci.size, ci.quantity - 1)
                              }
                              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-foreground w-6 text-center">
                              {ci.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(ci.itemId, ci.size, ci.quantity + 1)
                              }
                              disabled={ci.quantity >= maxQuantityPerItem}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium mb-0.5">
                              Rs.{ci.finalPrice} x {ci.billedQuantity}
                            </p>
                            <p className="text-[15px] font-bold text-primary">
                              Rs.{ci.itemTotal}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* ── Footer ── */}
            {totalItems > 0 && (
              <div
                className="px-5 pb-6 pt-4 space-y-3"
                style={{ borderTop: "1px solid hsl(var(--primary) / 0.10)" }}
              >
                {/* Closed banner */}
                {!isOpen && (
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    <p className="text-sm font-semibold text-red-500 text-center">
                      Ordering is currently unavailable.
                      <br className="md:hidden" /> We are closed right now.
                    </p>
                  </div>
                )}



                <div className="space-y-1 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>Rs.{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total Savings</span>
                    <span>Rs.{totalSavings}</span>
                  </div>
                  <div className="mt-1 border-t border-foreground/10 pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                    <span className="text-xl font-display font-bold text-primary">Rs.{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  title={!isOpen ? "We are currently closed" : ""}
                  onClick={() => {
                    if (!canPlaceOrder) return;
                    setIsCartOpen(false);
                    window.dispatchEvent(new CustomEvent("open-order-modal"));
                  }}
                  disabled={!canPlaceOrder}
                  className="w-full py-4 rounded-full font-bold text-base text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canPlaceOrder
                      ? "linear-gradient(135deg, #F5A623 0%, #E08910 100%)"
                      : "hsl(var(--muted))",
                    boxShadow: canPlaceOrder
                      ? "0 10px 30px rgba(245, 166, 35, 0.35)"
                      : "none",
                  }}
                >
                  Place Order via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
