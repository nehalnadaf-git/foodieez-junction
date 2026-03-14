"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";

export default function AdminUpiPage() {
  const { settings, patchSettings } = useAppSettings();
  const [upiId, setUpiId] = useState(settings.upi.upiId);
  const [enableCash, setEnableCash] = useState(settings.upi.enableCash);
  const [enableUpi, setEnableUpi] = useState(settings.upi.enableUpi);

  const handleSave = () => {
    let nextEnableCash = enableCash;
    let nextEnableUpi = enableUpi;

    if (!nextEnableCash && !nextEnableUpi) {
      nextEnableCash = true;
      toast.warning("Both methods cannot be disabled. Falling back to Cash.");
    }

    patchSettings({
      upi: {
        upiId: upiId.trim(),
        enableCash: nextEnableCash,
        enableUpi: nextEnableUpi,
      },
    });

    setEnableCash(nextEnableCash);
    setEnableUpi(nextEnableUpi);
    toast.success("UPI settings saved");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
        UPI Management
      </h2>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
            UPI ID
          </label>
          <input
            value={upiId}
            onChange={(event) => setUpiId(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setEnableCash((previous) => !previous)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 ${enableCash ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-white/70"}`}
          >
            Cash: {enableCash ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={() => setEnableUpi((previous) => !previous)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200 ${enableUpi ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-white/70"}`}
          >
            UPI: {enableUpi ? "On" : "Off"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
        >
          Save Settings
        </button>
      </div>
    </motion.section>
  );
}
