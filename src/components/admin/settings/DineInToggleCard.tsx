"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";

export function DineInToggleCard() {
  const { settings, patchSettings } = useAppSettings();
  const dineInEnabled = settings.order.dineInEnabled;

  const handleToggle = () => {
    const next = !dineInEnabled;
    patchSettings({ order: { ...settings.order, dineInEnabled: next } });
    toast.success(
      next
        ? "✅ Dine-In enabled for all customers (no QR needed)"
        : "✅ Dine-In now requires table QR scan"
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white">Dine-In Ordering</h3>
        <p className="mt-1 text-sm text-white/55 leading-relaxed">
          When <strong className="text-white/80">OFF</strong> — Dine-In is only unlocked when a customer scans a table QR code.
          When <strong className="text-white/80">ON</strong> — all customers can manually choose Dine-In.
        </p>
      </div>

      {/* Toggle row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
              dineInEnabled
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
            }`}
          >
            {dineInEnabled ? (
              <>
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Dine-In &amp; Takeaway Available
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Takeaway Only
              </>
            )}
          </div>
        </div>

        {/* Large toggle */}
        <button
          onClick={handleToggle}
          role="switch"
          aria-checked={dineInEnabled}
          aria-label="Toggle Dine-In ordering"
          className="relative shrink-0 w-[72px] h-[38px] rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{
            background: dineInEnabled
              ? "hsl(152 72% 45%)"
              : "rgba(255,255,255,0.12)",
            border: dineInEnabled
              ? "1.5px solid rgba(52,211,153,0.5)"
              : "1.5px solid rgba(255,255,255,0.15)",
          }}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-[3px] w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
            style={{
              left: dineInEnabled ? "calc(100% - 35px)" : "3px",
              background: dineInEnabled ? "#fff" : "rgba(255,255,255,0.6)",
            }}
          >
            {dineInEnabled ? (
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-white/60" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Description under toggle */}
      <p className="text-sm text-white/45">
        {dineInEnabled
          ? "All customers can choose Dine-In or Takeaway — no QR required."
          : "Dine-In is locked behind a QR scan. Takeaway is always available."}
      </p>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Customers who scan a table QR code always get Dine-In automatically —
          this setting does not affect QR table ordering.
        </p>
      </div>
    </div>
  );
}
