"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { type MenuCategory, type MenuItem } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface SortableCategoryRowProps {
  category: MenuCategory;
  items: MenuItem[];
  onToggleVisibility: (id: string) => void;
}

export function SortableCategoryRow({
  category,
  items,
  onToggleVisibility,
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const count = items.filter((item) => item.category === category.id).length;
  const isVisible = category.visible !== false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-4 py-3 mb-2",
        "backdrop-blur-xl border border-white/10 bg-white/5",
        "transition-shadow duration-200 group touch-none",
        isDragging && "z-50 shadow-[0_16px_48px_rgba(0,0,0,0.6)] scale-[1.02] border-amber-400/60 opacity-95",
        // Semi-transparent if hidden
        !isVisible && !isDragging && "opacity-60"
      )}
    >
      <div className="flex items-center gap-4">
        <button
          className={cn(
            "cursor-grab text-[#FBA919] opacity-70 transition-opacity hover:opacity-100",
            isDragging && "cursor-grabbing opacity-100"
          )}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-[#FBA919] border border-white/10">
            {(category.order ?? 0) + 1}
          </div>
          <p className="font-bold text-white tracking-wide">{category.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
          {count} {count === 1 ? "item" : "items"}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(category.id);
          }}
          className={cn(
            "flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all",
            isVisible 
              ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
          )}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                isVisible ? "animate-ping bg-green-400" : "bg-red-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                isVisible ? "bg-green-500" : "bg-red-500"
              )}
            />
          </span>
          {isVisible ? "Visible" : "Hidden"}
        </button>
      </div>
    </div>
  );
}
