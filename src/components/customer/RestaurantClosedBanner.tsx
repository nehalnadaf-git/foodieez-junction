"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";

export function RestaurantClosedBanner() {
  const { isOpen, closedMessage } = useRestaurantStatus();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-[100] flex w-full items-center justify-center gap-3 border-b border-red-500/40 bg-[hsl(20,18%,8%)]/95 px-4 py-3 shadow-[0_4px_24px_rgba(239,68,68,0.2)] backdrop-blur-md"
        >
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="font-semibold text-white tracking-wide text-sm md:text-base">
            {closedMessage}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
