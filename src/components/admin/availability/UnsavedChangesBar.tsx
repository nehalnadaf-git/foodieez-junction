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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3",
            "rounded-2xl border border-[#FBA919]/50 bg-[#FBA919]/10 backdrop-blur-xl",
            "flex items-center gap-3 shadow-[0_8px_32px_rgba(251,169,25,0.25)]",
            "lg:max-w-md w-[90%] md:w-auto"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#FBA919]/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-[#FBA919]" />
          </div>
          <p className="text-sm font-semibold text-white">
            You have unsaved changes
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
