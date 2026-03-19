"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Tag, CheckCircle2, XCircle, LayoutGrid } from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { useAvailability } from "@/hooks/useAvailability";
import { isOfferActive } from "@/utils/offer";
import { RestaurantStatusCard } from "@/components/admin/dashboard/RestaurantStatusCard";

const statCardClass =
  "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

export default function AdminDashboardPage() {
  const { settings } = useAppSettings();
  const { menuItems } = useMenuCatalog();
  const { availableCount, unavailableCount, totalCount, availabilityPercentage } = useAvailability();

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

      <RestaurantStatusCard />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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

      {/* Menu Availability Stat Card */}
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
