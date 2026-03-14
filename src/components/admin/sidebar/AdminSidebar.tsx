"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  UtensilsCrossed,
  QrCode,
  CreditCard,
  Star,
  Tag,
  Sliders,
  Shield,
  LogOut,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Live Orders", icon: BellRing },
  { href: "/admin/order-settings", label: "Order Settings", icon: Settings },
  { href: "/admin/tables", label: "Table Management", icon: QrCode },
  { href: "/admin/upi", label: "UPI Management", icon: CreditCard },
  { href: "/admin/reviews", label: "Review Management", icon: Star },
  { href: "/admin/offers", label: "Offers & Discounts", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Sliders },
  { href: "/admin/security", label: "Security", icon: Shield },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-black/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
          Foodieez Junction
        </h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-l-2 border-primary bg-primary/10 text-primary"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
