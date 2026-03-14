"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTableNumber } from "@/hooks/useTableNumber";

const TableIndicatorBanner = () => {
  const { tableNumber, isTableBannerDismissed, dismissTableBanner } =
    useTableNumber();

  const shouldShow = !!tableNumber && !isTableBannerDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="sticky top-16 z-[55] mx-auto w-[calc(100%-1.5rem)] max-w-2xl"
        >
          <div className="glass-strong rounded-2xl border border-primary/40 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm md:text-base font-heading font-semibold text-primary">
                📍 You are ordering from Table {tableNumber} - Dine In
              </p>
              <button
                onClick={dismissTableBanner}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss table banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TableIndicatorBanner;
