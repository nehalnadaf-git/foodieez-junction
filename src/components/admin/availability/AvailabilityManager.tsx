"use client";

import { useEffect, useState } from "react";
import { useAvailability } from "@/hooks/useAvailability";
import { StatsBar } from "./StatsBar";
import { ActionBar } from "./ActionBar";
import { CategorySection } from "./CategorySection";
import { UnsavedChangesBar } from "./UnsavedChangesBar";
import { SaveButton } from "./SaveButton";
import { motion, AnimatePresence } from "framer-motion";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useRouter } from "next/navigation";

export function AvailabilityManager() {
  const router = useRouter();
  const {
    stagedItems,
    hasUnsavedChanges,
    availableCount,
    unavailableCount,
    totalCount,
    searchQuery,
    setSearchQuery,
    filteredGroupedItems,
    toggleItem,
    selectAll,
    deselectAll,
    selectCategory,
    deselectCategory,
    saveChanges,
    discardChanges,
  } = useAvailability();

  // Handle browser close or refresh when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle internal navigation interception (basic approach via window interception 
  // since Next.js app router doesn't have native route change event interception easily)
  // For this reason, in the real app, we rely on the beforeunload + manual action checks.
  // The requirements mention "If admin tries to navigate away from the Availability Manager page with unsaved changes: Show a Radix UI confirmation dialog".
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // We capture Next.js Link clicks inside the dashboard if possible
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.href.includes(window.location.pathname) && anchor.target !== "_blank") {
        e.preventDefault();
        e.stopPropagation();
        setPendingRoute(anchor.href);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [hasUnsavedChanges]);

  return (
    <div className="relative max-w-[1200px] mx-auto min-h-screen">
      <UnsavedChangesBar hasUnsavedChanges={hasUnsavedChanges} />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6 sm:mb-8">
          <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-2xl sm:text-3xl md:text-4xl font-display font-bold text-transparent tracking-tight">
            Availability Manager
          </h2>
          <p className="mt-2 text-white/60 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
            Select which items are available today. Only selected items will be visible to customers by default.
          </p>
        </div>

        <StatsBar
          totalCount={totalCount}
          availableCount={availableCount}
          unavailableCount={unavailableCount}
        />

        <ActionBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />

        <div className="flex flex-col gap-2 mt-3 sm:mt-4 pb-20">
          {Object.keys(filteredGroupedItems).length === 0 ? (
            <div className="py-20 text-center text-white/40">
              <p className="text-sm">No products found matching "{searchQuery}"</p>
            </div>
          ) : (
            Object.entries(filteredGroupedItems).map(([categoryId, items]) => (
              <CategorySection
                key={categoryId}
                categoryId={categoryId}
                items={items}
                stagedItems={stagedItems}
                onToggleItem={toggleItem}
                onSelectCategory={selectCategory}
                onDeselectCategory={deselectCategory}
              />
            ))
          )}
        </div>
      </motion.div>

      <SaveButton 
        hasUnsavedChanges={hasUnsavedChanges}
        stagedItems={stagedItems}
        onSave={saveChanges}
      />

      <AlertDialog.Root open={!!pendingRoute} onOpenChange={(open) => !open && setPendingRoute(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-[100] w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl sm:rounded-[24px] border border-white/10 bg-[hsl(20,18%,8%)] p-4 sm:p-6 md:p-8 shadow-2xl duration-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <AlertDialog.Title className="text-lg sm:text-xl font-display font-bold text-white">
                Unsaved changes
              </AlertDialog.Title>
              <AlertDialog.Description className="text-xs sm:text-sm text-white/60 leading-relaxed">
                If you leave now, your changes will be lost.
              </AlertDialog.Description>
            </div>
            <div className="mt-6 sm:mt-8 gap-2 sm:gap-3 flex flex-col sm:flex-row justify-end">
              <AlertDialog.Cancel asChild>
                <button 
                  onClick={() => setPendingRoute(null)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-[#FBA919] text-[#FBA919] hover:bg-[#FBA919]/10 transition-colors"
                >
                  Stay
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => {
                    discardChanges();
                    if (pendingRoute) router.push(pendingRoute);
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-bold whitespace-nowrap"
                >
                  Leave
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
