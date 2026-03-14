"use client";

import Link from "next/link";
import { Clock3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAppSettings } from "@/context/AppSettingsContext";

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings, isHydrated } = useAppSettings();

  const isAdminRoute = pathname.startsWith("/admin");
  const shouldBlockPublicSite =
    isHydrated && settings.restaurant.maintenanceMode && !isAdminRoute;

  if (!isHydrated && !isAdminRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-xl">
          <p className="text-sm text-white/60">Loading storefront settings...</p>
        </div>
      </div>
    );
  }

  if (!shouldBlockPublicSite) {
    return <>{children}</>;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,166,35,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl md:p-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Clock3 className="h-7 w-7" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.32em] text-white/45">Maintenance Mode</p>
        <h1 className="mt-4 bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          {settings.restaurant.restaurantName} is temporarily offline
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/72 md:text-base">
          We&apos;re updating the storefront right now. Ordering and browsing are paused for a short while, but the admin panel remains available.
        </p>

        <div className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-left md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Restaurant</p>
            <p className="mt-2 text-sm font-semibold text-white">{settings.restaurant.restaurantName}</p>
            <p className="mt-1 text-sm text-white/60">{settings.restaurant.restaurantAddress}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Admin Access</p>
            <div className="mt-2 flex items-start gap-2 text-sm text-white/65">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>Admin routes stay available so you can switch maintenance mode off as soon as the update is complete.</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
          >
            Open Admin Panel
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
