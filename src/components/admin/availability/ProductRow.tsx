import { motion } from "framer-motion";
import { Plus, Check, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { type MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ProductRowProps {
  item: MenuItem;
  stagedItem: MenuItem;
  onToggle: (id: string) => void;
}

export function ProductRow({ item, stagedItem, onToggle }: ProductRowProps) {
  const isAvailable = stagedItem.available !== false;
  const hasImage = Boolean(item.image && item.image.trim().length > 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-2xl mb-2",
        "backdrop-blur-xl border transition-all duration-300",
        isAvailable
          ? "bg-white/[0.03] border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.1)] opacity-100"
          : "bg-black/20 border-white/[0.05] border-l-red-500 opacity-50 border-l-[3px]",
        // On hover slightly lift opacity for out-of-stock items so they feel actionable
        "hover:opacity-100"
      )}
    >
      {/* LEFT SIDE: Image + Name + Price */}
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
          {hasImage && item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <UtensilsCrossed className="w-5 h-5 text-white/20" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-white/90 line-clamp-1">{item.name}</span>
          <span className="text-xs text-[#FBA919] font-medium">₹{item.price ?? item.priceSmall ?? 0}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Action Toggle */}
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => onToggle(item.id)}
              className="relative w-8 h-8 rounded-full flex items-center justify-center focus:outline-none shrink-0"
              aria-label={isAvailable ? "Mark as Out of Stock" : "Mark as Available"}
              aria-pressed={isAvailable}
            >
              <motion.div
                initial={false}
                animate={isAvailable ? "available" : "unavailable"}
                variants={{
                  available: {
                    scale: 1,
                    backgroundColor: "hsl(142, 70.6%, 45.3%)", // green-500
                    borderColor: "hsl(142, 70.6%, 55%)",
                    boxShadow: "0 0 10px rgba(34,197,94,0.5)",
                  },
                  unavailable: {
                    scale: 1,
                    backgroundColor: "transparent",
                    borderColor: "rgba(255,255,255,0.2)",
                    boxShadow: "0 0 0px rgba(0,0,0,0)",
                  },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "absolute inset-0 rounded-full border-2",
                  "flex items-center justify-center"
                )}
              />
              
              {/* Internal Icons */}
              <div className="relative z-10 flex items-center justify-center h-full w-full">
                {isAvailable ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <Plus className="w-4 h-4 text-white/40" strokeWidth={2} />
                )}
              </div>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="left"
              sideOffset={8}
              className="bg-black/90 text-white text-xs px-2.5 py-1.5 rounded-lg border border-white/10 shadow-xl"
            >
              {isAvailable ? "Mark as Out of Stock" : "Mark as Available"}
              <Tooltip.Arrow className="fill-black/90" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </motion.div>
  );
}
