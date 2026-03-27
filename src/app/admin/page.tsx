"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Tag,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Truck,
  ShoppingBag,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { useAvailability } from "@/hooks/useAvailability";
import { RestaurantStatusCard } from "@/components/admin/dashboard/RestaurantStatusCard";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const card =
  "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

export default function AdminDashboardPage() {
  const { settings } = useAppSettings();
  const { menuItems } = useMenuCatalog();
  const { availableCount, unavailableCount, totalCount, availabilityPercentage } = useAvailability();
  const orders = useQuery(api.orders.getOrders);

  const activeOfferItems = menuItems.filter((item) => (item.offerType ?? "none") !== "none");
  const expiringSoonItems: Array<{ id: string; name: string; hoursLeft: number }> = [];

  // ── Order stats ─────────────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const pendingOrders = orders?.filter((o) => o.status === "pending") ?? [];
  const todayOrders = orders?.filter((o) => (o.serverTimestamp ?? 0) >= todayMs) ?? [];
  const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);
  const todayDeliveries = todayOrders.filter((o) => o.orderType === "delivery");

  const delivery = settings.delivery;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
        Dashboard
      </h2>

      <RestaurantStatusCard />

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <article className={card}>
          <p className="text-xs uppercase tracking-wider text-white/60">Pending Orders</p>
          <p className="mt-2 text-2xl font-bold text-amber-400">{orders === undefined ? "…" : pendingOrders.length}</p>
          <Link href="/admin/orders" className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">
            View Orders →
          </Link>
        </article>

        <article className={card}>
          <p className="text-xs uppercase tracking-wider text-white/60">Today&apos;s Orders</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{orders === undefined ? "…" : todayOrders.length}</p>
          <p className="mt-1 text-xs text-white/40">Rs.{todayRevenue} revenue</p>
        </article>

        <article className={card}>
          <p className="text-xs uppercase tracking-wider text-white/60">Active Offers</p>
          <p className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <Tag className="h-5 w-5" />
            {activeOfferItems.length}
          </p>
          <Link href="/admin/offers" className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">
            Manage Offers →
          </Link>
        </article>

        <article className={card}>
          <p className="text-xs uppercase tracking-wider text-white/60">Order ID Format</p>
          <p className="mt-2 font-mono text-lg font-semibold text-primary">
            #{settings.order.orderIdPrefix}-XXXX
          </p>
          <p className="mt-1 text-xs text-white/40">Max qty: {settings.order.maxQuantityPerItem} / item</p>
        </article>
      </div>

      {/* ── Order Type Status ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Takeaway — always on */}
        <div className={`${card} flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Takeaway</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
              Always Active
            </span>
          </div>
        </div>

        {/* Dine-In */}
        <div className={`${card} flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${settings.order.dineInEnabled ? "bg-primary/15" : "bg-white/5"}`}>
            <UtensilsCrossed className={`w-5 h-5 ${settings.order.dineInEnabled ? "text-primary" : "text-white/30"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Dine-In</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${settings.order.dineInEnabled ? "text-primary bg-primary/15 border border-primary/25" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"}`}>
              {settings.order.dineInEnabled ? "Open Access" : "QR Only"}
            </span>
          </div>
        </div>

        {/* Home Delivery */}
        <div className={`${card} flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${delivery.deliveryEnabled ? "bg-primary/15" : "bg-white/5"}`}>
            <Truck className={`w-5 h-5 ${delivery.deliveryEnabled ? "text-primary" : "text-white/30"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Home Delivery</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${delivery.deliveryEnabled ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/25" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
              {delivery.deliveryEnabled ? `Active · Rs.${delivery.deliveryCharge || "Free"}` : "Disabled"}
            </span>
            {delivery.deliveryEnabled && delivery.deliveryMinimumOrder > 0 && (
              <p className="text-[10px] text-white/40 mt-0.5">Min. Rs.{delivery.deliveryMinimumOrder}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Today's Delivery Stats (if delivery enabled) ── */}
      {delivery.deliveryEnabled && orders !== undefined && (
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Today&apos;s Deliveries</h3>
            <span className="ml-auto text-lg font-bold text-primary">{todayDeliveries.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-base font-bold text-primary">
                Rs.{todayDeliveries.reduce((s, o) => s + o.totalAmount, 0)}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Revenue</p>
            </div>
            <div>
              <p className="text-base font-bold text-primary">
                Rs.{todayDeliveries.reduce((s, o) => s + ((o as any).deliveryCharge ?? 0), 0)}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Charges</p>
            </div>
            <div>
              <p className="text-base font-bold text-primary">
                {delivery.deliveryEstimatedTime}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Est. Time</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide transition-all hover:bg-primary/20"
          >
            <Truck className="w-3.5 h-3.5" />
            Manage Delivery Settings
          </Link>
        </div>
      )}

      {/* ── Offer expiry warnings ── */}
      {expiringSoonItems.length > 0 && (
        <div className="grid gap-3">
          {expiringSoonItems.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 backdrop-blur-xl"
            >
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-200">
                <AlertTriangle className="h-4 w-4" />
                {entry.name} offer expires in {entry.hoursLeft.toFixed(1)} hours!
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Menu Availability ── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h3 className="text-lg font-bold text-white mb-5">Menu Availability</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-6 w-6 text-green-400 mb-2" />
            <p className="text-xl font-bold text-green-400">{availableCount}</p>
            <p className="text-xs text-white/60">Available</p>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <XCircle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-xl font-bold text-red-500">{unavailableCount}</p>
            <p className="text-xs text-white/60">Out of Stock</p>
          </div>
          <div className="flex flex-col items-center">
            <LayoutGrid className="h-6 w-6 text-white/80 mb-2" />
            <p className="text-xl font-bold text-white/80">{totalCount}</p>
            <p className="text-xs text-white/60">Total</p>
          </div>
        </div>

        <div className="w-full h-1.5 bg-white/10 rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-[#FBA919] rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${availabilityPercentage}%` }}
          />
        </div>
        <p className="text-xs font-semibold text-[#FBA919] text-right mb-5">
          {availabilityPercentage}% available
        </p>

        <Link
          href="/admin/availability"
          className="w-full flex items-center justify-center py-2.5 rounded-xl bg-[#FBA919]/10 border border-[#FBA919]/20 text-[#FBA919] font-bold text-sm tracking-wide transition-all hover:bg-[#FBA919]/20"
        >
          Manage Availability
        </Link>
      </div>

      {/* ── Quick Actions ── */}
      <div className={card}>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/order-settings"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)]"
          >
            Order Settings
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full bg-emerald-500/20 px-5 py-2 text-sm font-semibold text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/30"
          >
            Live Orders
            {pendingOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                {pendingOrders.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/reviews"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/90 transition-colors duration-200 hover:border-white/40"
          >
            Manage Reviews
          </Link>
          <Link
            href="/admin/offers"
            className="rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary/10"
          >
            Manage Offers
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white/70 transition-colors duration-200 hover:bg-white/5 flex items-center gap-2"
          >
            <Truck className="w-3.5 h-3.5" />
            Delivery Settings
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
