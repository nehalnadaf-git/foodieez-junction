"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Tag } from "lucide-react";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { isOfferActive } from "@/utils/offer";

const statCardClass =
  "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

export default function AdminDashboardPage() {
  const { isOpen } = useOperatingHours();
  const { settings } = useAppSettings();
  const { menuItems } = useMenuCatalog();

  const activeOfferItems = menuItems.filter((item) => item.offer && isOfferActive(item.offer));
  const expiringSoonItems = activeOfferItems
    .filter((item) => {
      if (!item.offer?.expiresAt) {
        return false;
      }

      const expiresAt = new Date(item.offer.expiresAt).getTime();
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      return expiresAt > now && expiresAt - now <= twoHours;
    })
    .map((item) => {
      const expiresAt = item.offer?.expiresAt ? new Date(item.offer.expiresAt).getTime() : Date.now();
      const hoursLeft = Math.max(0.1, (expiresAt - Date.now()) / (60 * 60 * 1000));
      return {
        id: item.id,
        name: item.name,
        hoursLeft,
      };
    });

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className={statCardClass}>
          <p className="text-xs uppercase tracking-wider text-white/60">Restaurant Status</p>
          <p className={`mt-2 text-xl font-semibold ${isOpen ? "text-green-400" : "text-red-400"}`}>
            {isOpen ? "Open" : "Closed"}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {settings.order.openTimeIst} - {settings.order.closeTimeIst} IST
          </p>
        </article>

        <article className={statCardClass}>
          <p className="text-xs uppercase tracking-wider text-white/60">Minimum Order</p>
          <p className="mt-2 text-xl font-semibold text-primary">
            {settings.restaurant.currencySymbol}
            {settings.order.minimumOrderValue}
          </p>
        </article>

        <article className={statCardClass}>
          <p className="text-xs uppercase tracking-wider text-white/60">Max Per Item</p>
          <p className="mt-2 text-xl font-semibold text-primary">{settings.order.maxQuantityPerItem}</p>
        </article>

        <article className={statCardClass}>
          <p className="text-xs uppercase tracking-wider text-white/60">Order Prefix</p>
          <p className="mt-2 font-mono text-xl font-semibold text-primary">#{settings.order.orderIdPrefix}-XXXX</p>
        </article>

        <article className={statCardClass}>
          <p className="text-xs uppercase tracking-wider text-white/60">Active Offers</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-primary">
            <Tag className="h-5 w-5" />
            {activeOfferItems.length}
          </p>
          <Link href="/admin/offers" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
            Open Offers & Discounts
          </Link>
        </article>
      </div>

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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/order-settings"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)]"
          >
            Update Order Settings
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-full bg-emerald-500/20 px-5 py-2 text-sm font-semibold text-emerald-300 transition-colors duration-200 hover:bg-emerald-500/30"
          >
            View Live Orders
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
        </div>
      </div>
    </motion.section>
  );
}
