"use client";

import { Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { DineSession } from "@/hooks/usePayAtLast";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";

interface SessionExpiryBannerProps {
  session: DineSession | null;
  onPayNow: () => void;
}

export function SessionExpiryBanner({ session, onPayNow }: SessionExpiryBannerProps) {
  const expiry = useSessionExpiry(session);

  if (!session || (!expiry.isExpiringSoon && !expiry.isExpiringSoon5)) return null;
  if (expiry.isExpired) return null; // SessionExpiredOverlay handles this case

  const isUrgent = expiry.isExpiringSoon5;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[90] flex flex-col items-center"
      style={{ background: "#ef4444" }}
    >
      {/* Pulsing attention ring */}
      <motion.div
        className="w-full"
        animate={isUrgent ? { opacity: [1, 0.75, 1] } : {}}
        transition={isUrgent ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-white shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-white shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {isUrgent ? (
              <p className="text-white text-[13px] font-bold leading-snug">
                URGENT: Session expires in {expiry.timeDisplay}
              </p>
            ) : (
              <>
                <p className="text-white text-[13px] font-bold leading-snug">
                  Your table session expires in {expiry.timeDisplay}
                </p>
                <p className="text-white/80 text-[11px] font-medium mt-0.5">
                  Please complete your order now.
                </p>
              </>
            )}
          </div>

          <button
            onClick={onPayNow}
            className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-extrabold text-red-600 bg-white hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Pay Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
