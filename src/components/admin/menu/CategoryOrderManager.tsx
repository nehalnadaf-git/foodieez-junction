"use client";

import { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  getSortedCategories,
  reassignCategoryOrder,
  resetCategoryOrder,
  saveCategoryOrder,
} from "@/utils/categoryOrder";
import { type MenuCategory, type MenuItem } from "@/data/menuData";
import { SortableCategoryRow } from "./SortableCategoryRow";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

interface CategoryOrderManagerProps {
  categories: MenuCategory[];
  items: MenuItem[];
  onOrderChange: (newCategories: MenuCategory[]) => void;
}

export function CategoryOrderManager({
  categories,
  items,
  onOrderChange,
}: CategoryOrderManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Local state for immediate smooth updates during drag operations
  const [activeCategories, setActiveCategories] = useState<MenuCategory[]>([]);

  // Sync internal state with external changes
  useEffect(() => {
    // Only update if we aren't dragging and the categories have actually changed,
    // to avoid layout shifts while interacting.
    setActiveCategories(getSortedCategories(categories));
  }, [categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to allow clicking the visibility button
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeCategories.findIndex((c) => c.id === active.id);
      const newIndex = activeCategories.findIndex((c) => c.id === over.id);

      // Move items in array
      const movedCategories = arrayMove(activeCategories, oldIndex, newIndex);
      
      // Reassign exact order ints
      const newOrderedCategories = reassignCategoryOrder(movedCategories);
      
      // Update local state for instant UX
      setActiveCategories(newOrderedCategories);
      
      // Persist to localStorage
      saveCategoryOrder(newOrderedCategories);
      
      // Notify parent to sync the main state naturally
      onOrderChange(newOrderedCategories);
      
      toast.success("Category order updated", {
        className: "border-l-4 border-l-[#FBA919]",
        style: { borderColor: "#FBA919" } 
      });
    }
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleResetOrder = () => {
    const defaultSorted = resetCategoryOrder(categories);
    setActiveCategories(defaultSorted);
    saveCategoryOrder(defaultSorted);
    onOrderChange(defaultSorted);
    setIsConfirmOpen(false);
    toast.success("Category order reset to default", {
      className: "border-l-4 border-l-[#FBA919]"
    });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = activeCategories.map((c) => 
      c.id === id ? { ...c, visible: c.visible === false ? true : false } : c
    );
    setActiveCategories(updated);
    saveCategoryOrder(updated);
    onOrderChange(updated);
    
    const cat = updated.find(c => c.id === id);
    if (cat?.visible) {
      toast.success(`"${cat.name}" is now visible`);
    } else {
      toast.error(`"${cat?.name}" is now hidden`);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
      
      {/* HEADER SECTION */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
      >
        <div>
          {isExpanded ? (
            <>
              <h3 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-xl font-bold text-transparent mb-1">
                Category Order
              </h3>
              <p className="text-sm text-white/60">
                Drag and drop categories to reorder how they appear on the website menu
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[#FBA919]">
                Manage Category Order
              </h3>
            </div>
          )}
        </div>
        <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ml-4 shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-white/70" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/70" />
          )}
        </div>
      </button>

      {/* DROPDOWN EXPANDED SECTION */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-white/5 mt-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-col mb-4">
                  <SortableContext
                    items={activeCategories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {activeCategories.map((category) => (
                      <SortableCategoryRow
                        key={category.id}
                        category={category}
                        items={items}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>

              {/* RESET BUTTON */}
              <div className="flex justify-start">
                <AlertDialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <AlertDialog.Trigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-white/40 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/5 hover:text-white">
                      <RotateCcw className="h-3 w-3" />
                      Reset to Default Order
                    </button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-[24px] border border-white/10 bg-[hsl(20,18%,8%)] p-6 md:p-8 shadow-2xl duration-200">
                      <div className="flex flex-col gap-4">
                        <AlertDialog.Title className="text-xl font-display font-bold text-white">
                          Reset Category Order?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="text-sm text-white/60 leading-relaxed">
                          Reset category order to the original default order? This cannot be undone.
                        </AlertDialog.Description>
                      </div>
                      <div className="mt-8 gap-3 flex flex-col md:flex-row justify-end">
                        <AlertDialog.Cancel asChild>
                          <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                            Cancel
                          </button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <button
                            onClick={handleResetOrder}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-transparent bg-[#FBA919] text-black hover:bg-[#FBA919]/90 shadow-[0_0_16px_rgba(251,169,25,0.4)] transition-all"
                          >
                            Reset
                          </button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
