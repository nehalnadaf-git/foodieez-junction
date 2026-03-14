"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-[hsl(20,18%,5%)] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,166,35,0.12),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(196,123,5,0.08),transparent_30%)]" />
      {!isLoginRoute && <AdminSidebar />}
      <main
        className={`relative z-10 px-4 py-6 lg:px-8 lg:py-8 ${
          isLoginRoute ? "" : "lg:ml-72"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
