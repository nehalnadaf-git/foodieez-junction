"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuFilter } from "@/hooks/useMenuFilter";

interface MenuFilterToggleProps {
  filter: MenuFilter;
  setFilter: (filter: MenuFilter) => void;
  availableCount: number;
  totalCount: number;
  unavailableCount: number;
}

export const MenuFilterToggle = ({
  filter,
  setFilter,
  availableCount,
  totalCount,
  unavailableCount,
}: MenuFilterToggleProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-end gap-4 mb-4 mt-2 w-full z-40 relative">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 w-full">
        {/* Count Label */}
        <div className="text-sm font-medium order-2 sm:order-1 relative min-h-[24px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter + availableCount}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {filter === "available" ? (
                <span className="text-green-500 font-bold tracking-wide">
                  {availableCount} items available now
                </span>
              ) : (
                <span className="text-white/60 tracking-wide">
                  {totalCount} items total <span className="mx-1.5 opacity-50">•</span> <span className="text-red-400 font-bold">{unavailableCount} unavailable</span>
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toggle Button Group */}
        <div
          className={cn(
            "relative flex items-center rounded-full order-1 sm:order-2",
            "backdrop-blur-xl border border-white/10 p-1"
          )}
          role="group"
          aria-label="Menu Availability Filter"
          style={{ background: "rgba(255, 255, 255, 0.05)" }}
        >
          {/* Available Button */}
          <button
            onClick={() => setFilter("available")}
            className={cn(
              "relative flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 outline-none w-[110px] sm:w-[130px] justify-center",
              filter === "available"
                ? "text-zinc-900"
                : "text-white/60 hover:text-white/90"
            )}
            aria-pressed={filter === "available"}
          >
            {filter === "available" && (
              <motion.div
                layoutId="filter-active-pill"
                className="absolute inset-0 rounded-full bg-[#FBA919] shadow-[0_0_12px_rgba(251,169,25,0.4)]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                  filter === "available" ? "text-zinc-900" : "text-green-500"
                )}
              />
              Available
            </span>
          </button>

          {/* All Items Button */}
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "relative flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 outline-none w-[110px] sm:w-[130px] justify-center",
              filter === "all"
                ? "text-zinc-900"
                : "text-white/60 hover:text-white/90"
            )}
            aria-pressed={filter === "all"}
          >
            {filter === "all" && (
              <motion.div
                layoutId="filter-active-pill"
                className="absolute inset-0 rounded-full bg-[#FBA919] shadow-[0_0_12px_rgba(251,169,25,0.4)]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              <LayoutGrid
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                  filter === "all" ? "text-zinc-900" : "text-white/60"
                )}
              />
              All Items
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
