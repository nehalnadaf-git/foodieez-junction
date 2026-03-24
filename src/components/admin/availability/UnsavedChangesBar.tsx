import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnsavedChangesBarProps {
  hasUnsavedChanges: boolean;
}

export function UnsavedChangesBar({ hasUnsavedChanges }: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={cn(
            "fixed bottom-20 sm:bottom-24 left-1/2 z-[60] px-3 sm:px-5 py-2.5 sm:py-3",
            "rounded-2xl border border-[#FBA919]/50 bg-[#FBA919]/10 backdrop-blur-xl",
            "flex items-center gap-2 sm:gap-3 shadow-[0_8px_32px_rgba(251,169,25,0.25)]",
            "w-max max-w-[calc(100%-2rem)]"
          )}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FBA919]/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#FBA919]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-white truncate">
            Unsaved changes
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
