"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { DineSession } from "@/hooks/usePayAtLast";

interface SessionExpiredOverlayProps {
  session: DineSession;
  currentOrderTotal: number;
  onPayCash: () => void;
  onPayUpi: () => void;
}

export function SessionExpiredOverlay({
  session,
  currentOrderTotal,
  onPayCash,
  onPayUpi,
}: SessionExpiredOverlayProps) {
  const totalDue = Math.round(session.runningTotal + currentOrderTotal);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[95] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "hsl(var(--background))",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 0 60px rgba(239,68,68,0.2)",
        }}
      >
        {/* Red top stripe */}
        <div className="bg-red-500 px-6 py-5 flex items-center gap-3">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <AlertTriangle className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <p className="text-white font-extrabold text-[15px]">Session Expired</p>
            <p className="text-white/75 text-[12px] font-medium mt-0.5">
              {session.orders.length} order{session.orders.length !== 1 ? "s" : ""} • {session.customerName}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Your session has expired.</p>
            <p className="text-muted-foreground text-sm mt-1">You have unpaid orders.</p>
          </div>

          <div
            className="rounded-xl py-4 px-5"
            style={{ background: "hsl(var(--foreground) / 0.04)", border: "1px solid hsl(var(--primary) / 0.15)" }}
          >
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Due</p>
            <p className="text-3xl font-extrabold text-primary mt-1">Rs.{totalDue}</p>
            <p className="text-xs text-muted-foreground mt-1">Order {session.orderId}</p>
          </div>

          <p className="text-xs text-muted-foreground">Please complete your payment to proceed.</p>

          {/* Payment buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={onPayCash}
              className="w-full py-4 rounded-xl font-bold text-[15px]"
              style={{
                background: "#FFC200",
                color: "#0a0a0a",
                boxShadow: "0 8px 24px rgba(255,194,0,0.3)",
              }}
            >
              Pay with Cash
            </button>
            <button
              onClick={onPayUpi}
              className="w-full py-4 rounded-xl font-bold text-[15px] border-2"
              style={{
                borderColor: "#FFC200",
                color: "#FFC200",
                background: "transparent",
              }}
            >
              Pay with UPI
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
