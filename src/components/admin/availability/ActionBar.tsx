import { Search, X, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion } from "framer-motion";

interface ActionBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function ActionBar({
  searchQuery,
  setSearchQuery,
  onSelectAll,
  onDeselectAll,
}: ActionBarProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="sticky top-14 sm:top-0 z-10 flex flex-col md:flex-row gap-2 sm:gap-4 items-center justify-between py-3 sm:py-4 bg-[hsl(20,18%,5%)]/95 backdrop-blur-xl border-b border-white/10 mb-4 sm:mb-6 px-1">
      {/* Search Input */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-2 sm:py-2.5 pl-9 sm:pl-10 pr-9 sm:pr-10",
            "text-xs sm:text-sm text-white placeholder:text-white/40 outline-none",
            "focus:border-[#FBA919] focus:ring-1 focus:ring-[#FBA919]/50 transition-all duration-200"
          )}
        />
        {searchQuery.length > 0 && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
        <button
          onClick={onSelectAll}
          className={cn(
            "flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2",
            "bg-[#FBA919] text-zinc-900 font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm",
            "shadow-[0_0_16px_rgba(251,169,25,0.3)] hover:shadow-[0_0_24px_rgba(251,169,25,0.5)]",
            "transition-all duration-200 active:scale-95 whitespace-nowrap"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">Select All</span>
          <span className="sm:hidden">Select</span>
        </button>

        <AlertDialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialog.Trigger asChild>
            <button
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-1 sm:gap-2",
                "bg-red-500 text-white font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm",
                "shadow-[0_0_16px_rgba(239,68,68,0.3)] hover:shadow-[0_0_24px_rgba(239,68,68,0.5)]",
                "transition-all duration-200 active:scale-95 whitespace-nowrap"
              )}
            >
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Deselect All</span>
              <span className="sm:hidden">Deselect</span>
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-[24px] border border-white/10 bg-[hsl(20,18%,8%)] p-6 md:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <div className="flex flex-col gap-4">
                <AlertDialog.Title className="text-xl font-display font-bold text-white">
                  Mark all items as Out of Stock?
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-white/60 leading-relaxed">
                  Are you sure you want to mark all items as Out of Stock? Customers will not be able to see any items.
                </AlertDialog.Description>
              </div>
              <div className="mt-6 sm:mt-8 gap-2 sm:gap-3 flex flex-col sm:flex-row justify-end">
                <AlertDialog.Cancel asChild>
                  <button className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-[#FBA919] text-[#FBA919] hover:bg-[#FBA919]/10 transition-colors">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={() => {
                      onDeselectAll();
                    }}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-transparent bg-red-500 text-white hover:bg-red-600 shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all"
                  >
                    Deselect All
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  );
}
