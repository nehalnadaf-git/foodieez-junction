"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OpenRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmOpen: (returnToSchedule: boolean) => void;
}

export function OpenRestaurantDialog({
  open,
  onOpenChange,
  onConfirmOpen,
}: OpenRestaurantDialogProps) {
  const [option, setOption] = useState<"manual" | "schedule">("schedule");

  const handleConfirm = () => {
    onConfirmOpen(option === "schedule");
    if (option === "schedule") {
      toast.success("Switched to automatic schedule", {
        className: "border-l-4 border-l-[#FBA919]",
        style: { borderColor: "#FBA919" }
      });
    } else {
      toast.success("Restaurant is now open");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-[24px] border border-white/10 bg-[hsl(20,18%,8%)] p-6 md:p-8 shadow-2xl duration-200">
          <div className="flex flex-col gap-4">
            <Dialog.Title className="text-xl font-display font-bold text-white">
              Open the Restaurant?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/60 leading-relaxed">
              Customers will be able to browse and place orders immediately.
            </Dialog.Description>
          </div>

          <div className="mt-8">
            <RadioGroup.Root
              className="flex flex-col gap-3"
              value={option}
              onValueChange={(val: "manual" | "schedule") => setOption(val)}
            >
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                  option === "manual" ? "border-green-500/40 bg-green-500/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <RadioGroup.Item
                  value="manual"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/30 bg-transparent shadow-sm hover:border-[#FBA919] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBA919]/40",
                    option === "manual" && "border-green-400 bg-transparent"
                  )}
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    Open manually
                  </span>
                  <span className="mt-1 text-xs text-white/60">
                    Stay open until I close it again
                  </span>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                  option === "schedule" ? "border-[#FBA919]/40 bg-[#FBA919]/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <RadioGroup.Item
                  value="schedule"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/30 bg-transparent shadow-sm hover:border-[#FBA919] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBA919]/40",
                    option === "schedule" && "border-[#FBA919] bg-transparent"
                  )}
                >
                  <RadioGroup.Indicator className="flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-[#FBA919]" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    Return to automatic schedule
                  </span>
                  <span className="mt-1 text-xs text-white/60">
                    Operating hours schedule will take control
                  </span>
                </div>
              </label>
            </RadioGroup.Root>
          </div>

          <div className="mt-8 gap-3 flex flex-col md:flex-row justify-end border-t border-white/10 pt-6">
            <Dialog.Close asChild>
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-transparent bg-green-500 text-black hover:bg-green-400 shadow-[0_0_16px_rgba(34,197,94,0.4)] transition-all"
            >
              Open Now
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
