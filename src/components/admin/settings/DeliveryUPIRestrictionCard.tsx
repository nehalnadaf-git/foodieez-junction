"use client";

import { motion } from "framer-motion";
import { CreditCard, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function DeliveryUPIRestrictionCard() {
  const restrictUPIOnly =
    useQuery(api.appSettings.getDeliveryRestrictUPIOnly) ?? false;
  const setRestriction = useMutation(
    api.appSettings.setDeliveryRestrictUPIOnly
  );

  const handleToggle = async () => {
    const next = !restrictUPIOnly;
    await setRestriction({ enabled: next });
    toast.success(
      next
        ? "Delivery restricted to UPI only"
        : "Cash on Delivery re-enabled"
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Restrict to UPI Only
        </h3>
        <p className="mt-1 text-sm text-white/55 leading-relaxed">
          When enabled, customers can only pay via UPI for delivery orders.
          Cash on Delivery will be hidden completely.
        </p>
      </div>

      {/* Toggle row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
              restrictUPIOnly
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {restrictUPIOnly ? "UPI Only" : "Cash & UPI Available"}
          </div>
        </div>

        {/* Toggle — min 48px touch target */}
        <button
          onClick={handleToggle}
          role="switch"
          aria-checked={restrictUPIOnly}
          aria-label="Toggle UPI-only restriction for delivery"
          className="relative shrink-0 w-[72px] h-[38px] rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{
            background: restrictUPIOnly
              ? "#FFC200"
              : "rgba(255,255,255,0.12)",
            border: restrictUPIOnly
              ? "1.5px solid rgba(255,194,0,0.5)"
              : "1.5px solid rgba(255,255,255,0.15)",
          }}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-[3px] w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
            style={{
              left: restrictUPIOnly ? "calc(100% - 35px)" : "3px",
              background: restrictUPIOnly ? "#0a0a0a" : "rgba(255,255,255,0.6)",
            }}
          >
            <CreditCard
              className={`w-4 h-4 ${
                restrictUPIOnly ? "text-[#FFC200]" : "text-white/60"
              }`}
            />
          </motion.div>
        </button>
      </div>

      {/* Description under toggle */}
      <p className="text-sm text-white/45 min-h-[1.25rem]">
        {restrictUPIOnly
          ? "Cash on Delivery is hidden. UPI payments only for delivery."
          : "Customers can pay with both Cash and UPI for delivery."}
      </p>

      {/* Info box — always visible */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          When <strong className="text-white/80">OFF</strong> — customers choose between Cash on Delivery and UPI.{" "}
          When <strong className="text-white/80">ON</strong> — only UPI is accepted for all delivery orders.
          Changes take effect instantly.
        </p>
      </div>
    </div>
  );
}
