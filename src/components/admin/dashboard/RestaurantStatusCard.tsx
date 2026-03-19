"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import { useAppSettings } from "@/context/AppSettingsContext";
import { OpenRestaurantDialog } from "./OpenRestaurantDialog";
import { CloseRestaurantDialog } from "./CloseRestaurantDialog";
import { cn } from "@/lib/utils";

export function RestaurantStatusCard() {
  const {
    isOpen,
    isManualOverride,
    closedMessage,
    manuallyClose,
    manuallyOpen,
    currentTimeIST,
  } = useRestaurantStatus();

  const { settings } = useAppSettings();

  // Simple AM/PM formatter for operating hours display
  const formatTime = (time: string) => {
    try {
      const [h, m] = time.split(":");
      const hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${m} ${ampm}`;
    } catch {
      return time;
    }
  };

  const formattedOperatingHours = `${formatTime(settings.order.openTimeIst)} – ${formatTime(settings.order.closeTimeIst)}`;

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);

  return (
    <>
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                isOpen ? "bg-green-400" : "bg-red-400"
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                isOpen ? "bg-green-500" : "bg-red-500"
              )}
            />
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">
            Restaurant Status
          </h2>
        </div>

        {/* STATUS DISPLAY */}
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="open-status"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 rounded-full bg-green-500/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-5xl font-display font-bold text-green-400 mb-3 tracking-wider">
                  OPEN
                </h3>
                <p className="text-sm text-white/60">
                  Customers can browse and place orders
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="closed-status"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 rounded-full bg-red-500/10 p-4">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-5xl font-display font-bold text-red-400 mb-3 tracking-wider">
                  CLOSED
                </h3>
                <p className="text-sm text-white/60">
                  Ordering is disabled for customers
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8">
            {isManualOverride ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FBA919]/30 bg-[#FBA919]/10 px-4 py-1.5 text-xs font-semibold text-[#FBA919]">
                <AlertCircle className="h-3.5 w-3.5" />
                Manually overridden
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/50">
                <Clock className="h-3.5 w-3.5" />
                Controlled by operating hours
              </div>
            )}
          </div>
        </div>

        {/* TOGGLE BUTTON */}
        <div className="flex justify-center border-t border-white/5 pt-8">
          {isOpen ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCloseDialogOpen(true)}
              className="group flex items-center justify-center gap-3 rounded-full bg-red-500/20 px-8 py-4 text-sm font-bold uppercase tracking-widest text-red-100 shadow-[0_0_32px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_48px_rgba(239,68,68,0.4)] hover:ring-red-500"
            >
              <XCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
              Close Restaurant
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOpenDialogOpen(true)}
              className="group flex items-center justify-center gap-3 rounded-full bg-green-500/20 px-8 py-4 text-sm font-bold uppercase tracking-widest text-green-100 shadow-[0_0_32px_rgba(34,197,94,0.15)] ring-1 ring-green-500/50 transition-all hover:bg-green-500 hover:text-black hover:shadow-[0_0_48px_rgba(34,197,94,0.4)] hover:ring-green-500"
            >
              <CheckCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />
              Open Restaurant
            </motion.button>
          )}
        </div>

        {/* AUTO SCHEDULE INDICATOR */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-white/50 bg-white/5 px-4 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>Current time: {currentTimeIST || "Syncing..."}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-white/50 bg-white/5 px-4 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span>Operating hours: {formattedOperatingHours}</span>
          </div>
        </div>
      </div>

      <CloseRestaurantDialog
        open={isCloseDialogOpen}
        onOpenChange={setIsCloseDialogOpen}
        currentMessage={closedMessage}
        onConfirmClose={(msg) => {
          manuallyClose(msg);
          setIsCloseDialogOpen(false);
        }}
      />

      <OpenRestaurantDialog
        open={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        onConfirmOpen={(returnToSchedule) => {
          manuallyOpen(returnToSchedule);
          setIsOpenDialogOpen(false);
        }}
      />
    </>
  );
}
