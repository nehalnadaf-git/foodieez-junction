import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type MenuItem } from "@/data/menuData";
import { ProductRow } from "./ProductRow";
import { cn } from "@/lib/utils";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";

interface CategorySectionProps {
  categoryId: string;
  items: MenuItem[];
  stagedItems: MenuItem[];
  onToggleItem: (id: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onDeselectCategory: (categoryId: string) => void;
}

export function CategorySection({
  categoryId,
  items,
  stagedItems,
  onToggleItem,
  onSelectCategory,
  onDeselectCategory,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { categories } = useMenuCatalog();
  const categoryInfo = categories.find((c) => c.id === categoryId);
  const categoryName = categoryInfo ? categoryInfo.name : categoryId;
  const totalInCategory = items.length;

  // Staged item lookups
  const categoryStagedItems = stagedItems.filter((i) => i.category === categoryId);
  const availableInCategory = categoryStagedItems.filter((i) => i.available !== false).length;
  const isAllSelected = availableInCategory === totalInCategory && totalInCategory > 0;
  const isNoneSelected = availableInCategory === 0;

  return (
    <div className="mb-6 flex flex-col">
      {/* Category Header Row */}
      <div
        className="flex items-center justify-between mb-3 px-1 py-1 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {/* Chevron */}
          <div className="p-1 rounded bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/70" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/70" />
            )}
          </div>
          
          <h3 className="font-display font-bold text-white text-lg tracking-wide">
            {categoryName}
          </h3>
          
          <div
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors",
              isAllSelected
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : isNoneSelected
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-[#FBA919]/10 text-[#FBA919] border-[#FBA919]/20"
            )}
          >
            {availableInCategory} / {totalInCategory} available
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAllSelected) {
              onDeselectCategory(categoryId);
            } else {
              onSelectCategory(categoryId);
            }
          }}
          className={cn(
            "text-[11px] uppercase font-bold tracking-wider px-3.5 py-1.5 rounded-lg border",
            "transition-all duration-200",
            isAllSelected
              ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
              : "bg-[#FBA919]/10 text-[#FBA919] border-[#FBA919]/30 hover:bg-[#FBA919]/20"
          )}
        >
          {isAllSelected ? "Deselect Category" : "Select Category"}
        </button>
      </div>

      {/* Product List Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden px-1"
          >
            <div className="flex flex-col pt-2">
              {items.map((item) => {
                const staged = stagedItems.find((s) => s.id === item.id) || item;
                return (
                  <ProductRow
                    key={item.id}
                    item={item}
                    stagedItem={staged}
                    onToggle={onToggleItem}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
