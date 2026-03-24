"use client";

import { motion } from "framer-motion";
import type { MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";
import { getOfferBadgeColor, getOfferLabel, isOfferActive } from "@/utils/offer";

interface OfferBadgeProps {
  item: Pick<MenuItem, "offerType" | "offerPercentage">;
  /** "overlay" = absolute-positioned corner badge (admin cards)
   *  "inline"  = flat tag rendered in document flow, below price */
  variant?: "overlay" | "inline";
}

/** Per-type inline styles for the modern flat tag design */
function getInlineStyle(offerType?: string): React.CSSProperties {
  switch (offerType) {
    case "bogo":
      return {
        background: "#FFB800",
        border: "1px solid #FFD366",
        color: "#000000",
      };
    case "percentage":
      return {
        background: "#10B981",
        border: "1px solid #34D399",
        color: "#FFFFFF",
      };
    case "new_tag":
      return {
        background: "#006EFF",
        border: "1px solid rgba(0, 110, 255, 1)",
        color: "#FFFFFF",
      };
    default:
      return {};
  }
}

export function OfferBadge({ item, variant = "overlay" }: OfferBadgeProps) {
  if (!isOfferActive(item.offerType)) {
    return null;
  }

  const label = getOfferLabel(item).toUpperCase();
  const isNew = item.offerType === "new_tag";

  /* ── Inline flat tag (below price) ── */
  if (variant === "inline") {
    return (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 4,
          padding: "2px 6px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.08em",
          lineHeight: 1,
          ...getInlineStyle(item.offerType),
        }}
      >
        <motion.span
          animate={isNew ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
          transition={
            isNew
              ? { duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
              : undefined
          }
        >
          {label}
        </motion.span>
      </motion.span>
    );
  }

  /* ── Overlay corner badge (admin cards — unchanged) ── */
  const topPosition = isNew ? "right-3 top-3" : "left-3 top-3";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "absolute z-20 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.02em]",
        topPosition,
        getOfferBadgeColor(item.offerType)
      )}
    >
      <motion.span
        animate={isNew ? { opacity: [1, 0.72, 1] } : { opacity: 1 }}
        transition={
          isNew ? { duration: 1.4, repeat: Number.POSITIVE_INFINITY } : undefined
        }
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
