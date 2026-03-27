"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Zap, BadgeCheck, BadgeX } from "lucide-react";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40 placeholder:text-white/30";

const labelClass = "mb-1 block text-xs uppercase tracking-wider text-white/70";

function SaveBtn({ onClick, label = "Save" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.4)]"
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/8 bg-white/3 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-white/60">{title}</h4>
      {children}
    </div>
  );
}

export function DeliverySettingsCard() {
  const { settings, patchSettings } = useAppSettings();
  const d = settings.delivery;
  const orders = useQuery(api.orders.getOrders);

  // ── Delivery stats ─────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const deliveryOrders =
    orders?.filter((o) => o.orderType === "delivery") ?? [];
  const todayDeliveries = deliveryOrders.filter(
    (o) => (o.serverTimestamp ?? 0) >= todayMs
  );
  const todayRevenue = todayDeliveries.reduce((s, o) => s + o.totalAmount, 0);
  const todayCharges = todayDeliveries.reduce(
    (s, o) => s + (o.deliveryCharge ?? 0),
    0
  );
  const avgOrderValue =
    todayDeliveries.length > 0
      ? Math.round(todayRevenue / todayDeliveries.length)
      : 0;

  // ── Local state for each editable section ──────────────────────────────────
  const [charge, setCharge] = useState(String(d.deliveryCharge));
  const [minOrder, setMinOrder] = useState(String(d.deliveryMinimumOrder));
  const [areaDesc, setAreaDesc] = useState(d.deliveryAreaDescription);
  const [maxDist, setMaxDist] = useState(d.deliveryMaxDistance);
  const [areas, setAreas] = useState(d.deliveryAvailableAreas);
  const [instructions, setInstructions] = useState(d.deliveryInstructions);
  const [estTime, setEstTime] = useState(d.deliveryEstimatedTime);
  const [waNumber, setWaNumber] = useState(d.deliveryWhatsappNumber);

  // Sync on first load when settings hydrate
  useEffect(() => {
    setCharge(String(d.deliveryCharge));
    setMinOrder(String(d.deliveryMinimumOrder));
    setAreaDesc(d.deliveryAreaDescription);
    setMaxDist(d.deliveryMaxDistance);
    setAreas(d.deliveryAvailableAreas);
    setInstructions(d.deliveryInstructions);
    setEstTime(d.deliveryEstimatedTime);
    setWaNumber(d.deliveryWhatsappNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.delivery.deliveryEnabled]); // only when toggle changes to avoid overwriting typing

  const patch = (partial: Partial<typeof d>) => {
    patchSettings({ delivery: { ...d, ...partial } });
  };

  const handleToggle = () => {
    const next = !d.deliveryEnabled;
    patch({ deliveryEnabled: next });
    toast.success(
      next ? "Home delivery is now active" : "Home delivery has been disabled"
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-5">
      {/* ── Header ── */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Home Delivery
        </h3>
        <p className="mt-1 text-sm text-white/55 leading-relaxed">
          Enable or disable home delivery orders. When disabled, customers will
          not see the delivery option at all.
        </p>
      </div>

      {/* ── Today's stats ── */}
      {orders !== undefined && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Deliveries", value: todayDeliveries.length },
            { label: "Delivery Revenue", value: `Rs.${todayRevenue}` },
            { label: "Avg. Order Value", value: `Rs.${avgOrderValue}` },
            { label: "Charges Collected", value: `Rs.${todayCharges}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
            >
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Master toggle ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
              d.deliveryEnabled
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-red-500/15 border border-red-500/30 text-red-400"
            }`}
          >
            {d.deliveryEnabled ? (
              <>
                <BadgeCheck className="w-3.5 h-3.5" />
                Delivery Active
              </>
            ) : (
              <>
                <BadgeX className="w-3.5 h-3.5" />
                Delivery Disabled
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          role="switch"
          aria-checked={d.deliveryEnabled}
          aria-label="Toggle home delivery"
          className="relative shrink-0 w-[72px] h-[38px] rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          style={{
            background: d.deliveryEnabled
              ? "hsl(152 72% 45%)"
              : "rgba(255,255,255,0.12)",
            border: d.deliveryEnabled
              ? "1.5px solid rgba(52,211,153,0.5)"
              : "1.5px solid rgba(255,255,255,0.15)",
          }}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="absolute top-[3px] w-8 h-8 rounded-full shadow-lg flex items-center justify-center"
            style={{
              left: d.deliveryEnabled ? "calc(100% - 35px)" : "3px",
              background: d.deliveryEnabled ? "#fff" : "rgba(255,255,255,0.6)",
            }}
          >
            <Truck
              className={`w-4 h-4 ${d.deliveryEnabled ? "text-emerald-600" : "text-white/60"}`}
            />
          </motion.div>
        </button>
      </div>

      <p className="text-sm text-white/45">
        {d.deliveryEnabled
          ? "Customers can place delivery orders from your website."
          : "The delivery option is completely hidden from customers."}
      </p>

      {/* ── Info box ── */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          All changes take effect instantly. Toggle ON to start accepting delivery
          orders; toggle OFF to pause without losing any settings.
        </p>
      </div>

      {/* ── Settings sections (always visible so admin can pre-configure) ── */}
      <div className="space-y-4">

        {/* WhatsApp number */}
        <Section title="Delivery WhatsApp Number">
          <label className={labelClass}>WhatsApp Number for Delivery Orders</label>
          <input
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            placeholder="+91 9743862836"
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Delivery orders will be sent to this number. Leave blank to use the takeaway number.
          </p>
          <SaveBtn
            label="Save WhatsApp Number"
            onClick={() => {
              patch({ deliveryWhatsappNumber: waNumber });
              toast.success("Delivery WhatsApp number updated");
            }}
          />
        </Section>

        {/* Delivery charge */}
        <Section title="Delivery Charge">
          <label className={labelClass}>Delivery Charge (Rs.)</label>
          <input
            type="number"
            min={0}
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
            placeholder="Enter delivery charge (0 = Free)"
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Set to 0 to offer Free Delivery. The amount is added to the customer&apos;s total.
          </p>
          <SaveBtn
            label="Save Delivery Charge"
            onClick={() => {
              patch({ deliveryCharge: Number(charge) || 0 });
              toast.success("Delivery charge updated");
            }}
          />
        </Section>

        {/* Minimum order */}
        <Section title="Minimum Order for Delivery">
          <label className={labelClass}>Minimum Order Amount (Rs.)</label>
          <input
            type="number"
            min={0}
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="Enter minimum order amount (0 = no minimum)"
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Customers cannot place delivery orders below this amount. Set to 0 for no minimum.
          </p>
          <SaveBtn
            label="Save Minimum Order"
            onClick={() => {
              patch({ deliveryMinimumOrder: Number(minOrder) || 0 });
              toast.success("Minimum order amount updated");
            }}
          />
        </Section>

        {/* Estimated time */}
        <Section title="Estimated Delivery Time">
          <label className={labelClass}>Estimated Delivery Time</label>
          <input
            value={estTime}
            onChange={(e) => setEstTime(e.target.value)}
            placeholder="e.g. 30-45 mins"
            className={inputClass}
          />
          <SaveBtn
            onClick={() => {
              patch({ deliveryEstimatedTime: estTime });
              toast.success("Estimated delivery time updated");
            }}
          />
        </Section>

        {/* Delivery area */}
        <Section title="Delivery Area & Coverage">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Area Description (shown to customers)</label>
              <input
                value={areaDesc}
                onChange={(e) => setAreaDesc(e.target.value)}
                placeholder="e.g. Bengeri, Vidya Nagar, Hubballi"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Serviceable Areas (one per line)</label>
              <textarea
                value={areas}
                onChange={(e) => setAreas(e.target.value)}
                rows={4}
                placeholder={"Bengeri\nVidya Nagar\nNavanagar\nCBS"}
                className={inputClass + " resize-none"}
              />
            </div>
            <div>
              <label className={labelClass}>Maximum Delivery Distance</label>
              <input
                value={maxDist}
                onChange={(e) => setMaxDist(e.target.value)}
                placeholder="e.g. 3 km"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Delivery Instructions for Customers</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="e.g. Please keep your phone available for delivery updates"
                className={inputClass + " resize-none"}
              />
            </div>
            <SaveBtn
              label="Save Delivery Area Settings"
              onClick={() => {
                patch({
                  deliveryAreaDescription: areaDesc,
                  deliveryMaxDistance: maxDist,
                  deliveryAvailableAreas: areas,
                  deliveryInstructions: instructions,
                });
                toast.success("Delivery area settings updated");
              }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
