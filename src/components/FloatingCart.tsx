"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePayAtLast } from "@/hooks/usePayAtLast";

const FloatingCart = () => {
  const { totalItems, totalPrice, setIsCartOpen, isCartOpen } = useCart();
  const { hasActiveOrders, isHydrated } = usePayAtLast();

  const shouldShow = !isCartOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="floating-cart"
          initial={{ x: 100, opacity: 0, scale: 0.85 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 80, opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="fixed bottom-6 right-4 md:right-8 z-[55]"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`View cart — ${totalItems} items`}
            className="group relative flex items-center justify-center transition-transform hover:-translate-x-1 duration-300"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)",
              color: "hsl(var(--primary-foreground))",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              boxShadow:
                "0 12px 36px -4px hsl(var(--primary) / 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
              border: "1px solid hsl(var(--primary) / 0.6)",
            }}
          >
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="h-full w-full bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-glide-slow mix-blend-overlay" />
            </div>

            <div className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <ShoppingCart
                className="w-[24px] h-[24px]"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
              />
              <motion.span
                key={totalItems}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-[22px] h-[22px] rounded-full text-[11px] font-bold flex items-center justify-center"
                style={{
                  background: "hsl(var(--background))",
                  color: "hsl(var(--primary))",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.15), inset 0 0 0 1px hsl(var(--primary) / 0.15)",
                }}
              >
                {totalItems > 9 ? "9+" : totalItems}
              </motion.span>
            </div>

            <span
              className="absolute inset-0 rounded-full animate-pulse-ring pointer-events-none"
              style={{ background: "hsl(var(--primary))", zIndex: -1 }}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCart;
