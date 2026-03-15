"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, getItemPrice } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { useAppSettings } from "@/context/AppSettingsContext";

const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    totalItems,
    maxQuantityPerItem,
    minimumOrderValue,
    remainingForMinimum,
    meetsMinimumOrder,
  } = useCart();
  const { isOpen } = useOperatingHours();
  const { settings } = useAppSettings();

  const canPlaceOrder = totalItems > 0 && meetsMinimumOrder && isOpen;

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
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </button>
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
                    const price = getItemPrice(ci.item, ci.size);
                    const isVeg = ci.item.isVeg;
                    return (
                      <motion.div
                        key={`${ci.item.id}-${ci.size}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, scale: 0.95 }}
                        transition={{ duration: 0.22 }}
                        className="rounded-2xl px-4 py-3.5 flex items-center gap-4"
                        style={{
                          background: "hsl(var(--foreground) / 0.04)",
                          border: "1px solid hsl(var(--foreground) / 0.07)",
                        }}
                      >
                        {/* Veg / Non-veg indicator dot */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-start pt-0.5">
                          <div
                            className="w-4 h-4 rounded-sm flex items-center justify-center"
                            style={{
                              border: `1.5px solid ${isVeg ? "#22c55e" : "#ef4444"}`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: isVeg ? "#22c55e" : "#ef4444",
                              }}
                            />
                          </div>
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground leading-tight truncate">
                            {ci.item.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            {ci.size !== "single"
                              ? `${ci.size === "small" ? "Small" : "Large"} · `
                              : ""}
                            ₹{price} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div
                          className="flex items-center gap-1.5 rounded-full px-1 py-1"
                          style={{
                            background: "hsl(var(--foreground) / 0.06)",
                            border: "1px solid hsl(var(--foreground) / 0.08)",
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(ci.item.id, ci.size, ci.quantity - 1)
                            }
                            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-foreground w-5 text-center">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(ci.item.id, ci.size, ci.quantity + 1)
                            }
                            disabled={ci.quantity >= maxQuantityPerItem}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span
                          className="text-sm font-bold text-primary w-14 text-right flex-shrink-0"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          ₹{price * ci.quantity}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(ci.item.id, ci.size)}
                          className="text-muted-foreground/50 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                    <p className="text-sm font-semibold text-red-400">
                      We&apos;re currently closed. Opens at{" "}
                      {(() => {
                        const [hh, mm] = settings.order.openTimeIst.split(":");
                        const h = parseInt(hh, 10);
                        const suffix = h >= 12 ? "PM" : "AM";
                        const h12 = h % 12 || 12;
                        return `${h12}:${mm} ${suffix}`;
                      })()}{" "}
                      today!
                    </p>
                  </div>
                )}

                {/* Min order banner */}
                {!meetsMinimumOrder && (
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: "hsl(var(--primary) / 0.07)",
                      border: "1px solid hsl(var(--primary) / 0.22)",
                    }}
                  >
                    <p className="text-sm font-semibold text-primary">
                      Minimum order is {settings.restaurant.currencySymbol}
                      {minimumOrderValue}. Add {settings.restaurant.currencySymbol}
                      {remainingForMinimum} more to continue.
                    </p>
                  </div>
                )}

                {/* Subtotal row */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span
                    className="text-2xl font-display font-bold"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    ₹{totalPrice}
                  </span>
                </div>

                {/* Place Order CTA */}
                <button
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
