import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { type MenuItem } from "@/data/menuData";
import { getAvailableCount, getUnavailableCount } from "@/utils/availability";

interface SaveButtonProps {
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void>;
  stagedItems: MenuItem[];
}

export function SaveButton({ hasUnsavedChanges, onSave, stagedItems }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate tiny network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    await onSave();
    
    const available = getAvailableCount(stagedItems);
    const unavailable = getUnavailableCount(stagedItems);
    
    toast.success("Availability updated successfully!", {
      description: `${available} items available, ${unavailable} out of stock.`,
      className: "border-l-4 border-l-green-500",
      icon: <CheckIcon />,
    });
    
    setIsSaving(false);
  };

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );

  return (
    <AnimatePresence>
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 40, x: "-50%" }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 z-[60] w-[90%] sm:w-auto px-2 sm:px-0"
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3",
              "bg-[#FBA919] text-zinc-900 font-bold px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base",
              "shadow-[0_0_24px_rgba(251,169,25,0.6)] hover:shadow-[0_0_32px_rgba(251,169,25,0.8)]",
              "transition-all duration-300 transform sm:hover:-translate-y-1 active:scale-95",
              isSaving && "opacity-80 cursor-wait shadow-[0_0_16px_rgba(251,169,25,0.4)]"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="whitespace-nowrap">
              {isSaving ? "Saving..." : "Save"}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
