"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OutOfStockBadgeProps {
  className?: string;
}

export const OutOfStockBadge = ({ className }: OutOfStockBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className={cn(
        "absolute top-3 right-3 z-50 pointer-events-none",
        "bg-red-500/90 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider",
        "px-2.5 py-1 rounded-lg shadow-[0_4px_12px_rgba(239,68,68,0.3)] border border-red-400/30",
        "backdrop-blur-md",
        className
      )}
    >
      Out of Stock
    </motion.div>
  );
};
