"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Settings,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Star,
  Tag,
  Sliders,
  LogOut,
  BellRing,
  Menu,
  X,
  PackageCheck,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Live Orders", icon: BellRing },
  { href: "/admin/order-settings", label: "Order Settings", icon: Settings },
  { href: "/admin/availability", label: "Availability", icon: PackageCheck },
  { href: "/admin/menu", label: "Menu Management", icon: UtensilsCrossed },
  { href: "/admin/tables", label: "Table Management", icon: QrCode },
  { href: "/admin/upi", label: "UPI Management", icon: CreditCard },
  { href: "/admin/reviews", label: "Review Management", icon: Star },
  { href: "/admin/offers", label: "Offers & Discounts", icon: Tag },
  { href: "/admin/settings", label: "Settings & Delivery", icon: Sliders },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const NavLinks = () => (
    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-l-2 border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(245,166,35,0.15)]"
                : "text-white/60 hover:bg-white/5 hover:text-white/90"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── MOBILE TOPBAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-black/60 px-4 backdrop-blur-xl">
        <span className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-lg font-bold text-transparent">
          Foodieez Junction
        </span>
        <button
          id="admin-mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE SLIDE-OVER DRAWER ── */}
      <div
        ref={drawerRef}
        className={cn(
          "lg:hidden fixed top-0 right-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-l border-white/10 bg-[hsl(20,18%,5%)] shadow-2xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Admin navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-xl font-bold text-transparent">
            Admin Panel
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 transition-colors hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavLinks />

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-white/10 bg-black/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="border-b border-white/10 px-6 py-6">
          <h1 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-2xl font-bold text-transparent">
            Foodieez Junction
          </h1>
          <p className="mt-1 text-xs text-white/40 uppercase tracking-widest">Admin Panel</p>
        </div>

        <NavLinks />

        <div className="mt-auto border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
