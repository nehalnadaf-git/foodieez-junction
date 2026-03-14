"use client";

import { motion } from "framer-motion";
import type { ItemOffer } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { getOfferBadgeColor, getOfferLabel, isOfferActive } from "@/utils/offer";

interface OfferBadgeProps {
  offer?: ItemOffer;
}

export function OfferBadge({ offer }: OfferBadgeProps) {
  if (!offer || !isOfferActive(offer)) {
    return null;
  }

  const label = getOfferLabel(offer);
  const shouldPulse = offer.type === "limited_time" || offer.type === "today_only";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md",
        getOfferBadgeColor(offer)
      )}
    >
      <motion.span
        animate={shouldPulse ? { opacity: [1, 0.72, 1] } : { opacity: 1 }}
        transition={shouldPulse ? { duration: 1.4, repeat: Number.POSITIVE_INFINITY } : undefined}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
