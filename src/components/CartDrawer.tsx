"use client";

import { X, Minus, Plus, ShoppingCart } from "lucide-react";
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/60 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-[75] glass-strong rounded-none flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10">
              <h2 className="text-2xl font-display text-foreground tracking-wider">
                Your Order 🛒
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-lg font-heading font-bold text-muted-foreground">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Let&apos;s fix that! 🍔
                  </p>
                </div>
              ) : (
                items.map((ci) => {
                  const price = getItemPrice(ci.item, ci.size);
                  return (
                    <div
                      key={`${ci.item.id}-${ci.size}`}
                      className="glass p-3 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-xl flex-shrink-0">
                        {ci.item.isVeg ? "🥦" : "🍗"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-heading font-bold text-foreground truncate">
                          {ci.item.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-accent">
                          {ci.size !== "single" &&
                            `${ci.size === "small" ? "S" : "L"} · `}
                          ₹{price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(ci.item.id, ci.size, ci.quantity - 1)
                          }
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-heading font-bold w-5 text-center">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(ci.item.id, ci.size, ci.quantity + 1)
                          }
                          disabled={ci.quantity >= maxQuantityPerItem}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-display text-primary w-12 text-right">
                        ₹{price * ci.quantity}
                      </span>
                      <button
                        onClick={() => removeItem(ci.item.id, ci.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {totalItems > 0 && (
              <div className="p-5 border-t border-primary/10 space-y-4">
                {!isOpen && (
                  <div className="glass rounded-xl border-red-500/40 bg-red-500/10 px-4 py-3">
                    <p className="text-sm font-heading font-semibold text-red-300">
                      We&apos;re currently closed. Opens at 2:00 PM today!
                    </p>
                  </div>
                )}

                {!meetsMinimumOrder && (
                  <div className="glass rounded-xl border-primary/40 bg-primary/10 px-4 py-3">
                    <p className="text-sm font-heading font-semibold text-primary">
                      Minimum order is {settings.restaurant.currencySymbol}
                      {minimumOrderValue}. Add {settings.restaurant.currencySymbol}
                      {remainingForMinimum} more to place your order.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-foreground">
                    Subtotal
                  </span>
                  <span className="text-2xl font-display text-primary tracking-wider">
                    ₹{totalPrice}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (!canPlaceOrder) {
                      return;
                    }
                    setIsCartOpen(false);
                    window.dispatchEvent(new CustomEvent("open-order-modal"));
                  }}
                  disabled={!canPlaceOrder}
                  title={
                    !isOpen
                      ? "Ordering is disabled outside operating hours"
                      : !meetsMinimumOrder
                        ? `Minimum order is ${settings.restaurant.currencySymbol}${minimumOrderValue}`
                        : undefined
                  }
                  className="w-full py-4 rounded-full bg-primary text-primary-foreground font-heading font-bold text-base shimmer hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
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
