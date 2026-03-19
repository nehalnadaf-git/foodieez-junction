import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, CheckCircle2, XCircle } from "lucide-react";

interface StatsBarProps {
  totalCount: number;
  availableCount: number;
  unavailableCount: number;
}

export function StatsBar({
  totalCount,
  availableCount,
  unavailableCount,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
      {/* Total Items */}
      <div className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-h-[90px]">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 text-white/80">
          <LayoutGrid className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-wider">Total</span>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={totalCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-2xl md:text-3xl font-display font-bold text-white/90"
          >
            {totalCount}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Available */}
      <div className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl border border-green-500/20 backdrop-blur-xl bg-green-500/10 shadow-[0_8px_32px_rgba(34,197,94,0.15)] min-h-[90px]">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-center">Available</span>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={availableCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-2xl md:text-3xl font-display font-bold text-green-400"
          >
            {availableCount}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Out of Stock */}
      <div className="flex flex-col items-center justify-center py-4 px-2 rounded-2xl border border-red-500/20 backdrop-blur-xl bg-red-500/10 shadow-[0_8px_32px_rgba(239,68,68,0.15)] min-h-[90px]">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-wider text-center">Out of Stock</span>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={unavailableCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-2xl md:text-3xl font-display font-bold text-red-500"
          >
            {unavailableCount}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
