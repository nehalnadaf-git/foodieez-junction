"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CloseRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMessage: string;
  onConfirmClose: (message: string) => void;
}

export function CloseRestaurantDialog({
  open,
  onOpenChange,
  currentMessage,
  onConfirmClose,
}: CloseRestaurantDialogProps) {
  const [message, setMessage] = useState(currentMessage || "We are currently closed. We will be back soon!");

  const handleConfirm = () => {
    onConfirmClose(message);
    toast.error("Restaurant is now closed");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-[24px] border border-white/10 bg-[hsl(20,18%,8%)] p-6 md:p-8 shadow-2xl duration-200">
          <div className="flex flex-col gap-4">
            <Dialog.Title className="text-xl font-display font-bold text-white">
              Close the Restaurant?
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/60 leading-relaxed">
              Customers will not be able to place orders until you reopen. They can still browse the menu.
            </Dialog.Description>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">
              Message to show customers
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.substring(0, 100))}
              placeholder="We are currently closed..."
              className={cn(
                "min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-200",
                "focus:border-[#FBA919] focus:ring-2 focus:ring-[#FBA919]/40"
              )}
            />
            <div className="mt-2 flex justify-end">
              <span className={cn(
                "text-xs",
                message.length === 100 ? "text-[#FBA919]" : "text-white/40"
              )}>
                {message.length} / 100
              </span>
            </div>
          </div>

          <div className="mt-8 gap-3 flex flex-col md:flex-row justify-end border-t border-white/10 pt-6">
            <Dialog.Close asChild>
              <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-transparent bg-red-500 text-white hover:bg-red-400 shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all"
            >
              Close Now
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
