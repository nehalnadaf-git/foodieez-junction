"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuFilter } from "@/hooks/useMenuFilter";

interface MenuEmptyStateProps {
  setFilter: (filter: MenuFilter) => void;
}

export const MenuEmptyState = ({ setFilter }: MenuEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "max-w-md mx-auto mt-12 mb-20 p-8 md:p-12 text-center relative",
        "backdrop-blur-xl border border-white/10 rounded-[32px]",
        "shadow-2xl overflow-hidden"
      )}
      style={{
        background: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FBA919]/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 mb-6 rounded-full bg-[#FBA919]/20 flex items-center justify-center border border-[#FBA919]/30 shadow-[0_0_30px_rgba(251,169,25,0.2)]">
          <UtensilsCrossed className="w-10 h-10 text-[#FBA919]" />
        </div>
        
        <h3 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-[#FBA919] mb-3">
          Back Soon!
        </h3>
        
        <p className="text-white/60 text-sm md:text-base mb-8 max-w-[260px] leading-relaxed">
          We're currently restocking our menu. Check back in a little while!
        </p>
        
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "bg-[#FBA919] text-zinc-900 font-bold px-8 py-3.5 rounded-full text-sm",
            "transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(251,169,25,0.4)]",
            "active:translate-y-0 active:shadow-md"
          )}
        >
          See Full Menu
        </button>
      </div>
    </motion.div>
  );
};
