"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, KeyRound, LogOut, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface SecurityStatus {
  hasUsername: boolean;
  hasPassword: boolean;
  hasSessionSecret: boolean;
  hasStrongSessionSecret: boolean;
  secretLength: number;
}

export default function AdminSecurityPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/security/status", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load security status");
      }

      const result = (await response.json()) as SecurityStatus;
      setStatus(result);
    } catch {
      toast.error("Unable to load security status");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Session closed");
      router.replace("/admin/login");
    } catch {
      toast.error("Unable to logout right now");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const checks = [
    {
      label: "Admin username configured",
      ok: status?.hasUsername ?? false,
      detail: "Required for login validation on the server.",
    },
    {
      label: "Admin password configured",
      ok: status?.hasPassword ?? false,
      detail: "Stored in environment variables, not in browser storage.",
    },
    {
      label: "Session secret present",
      ok: status?.hasSessionSecret ?? false,
      detail: "Used to sign and verify the admin cookie token.",
    },
    {
      label: "Session secret strength",
      ok: status?.hasStrongSessionSecret ?? false,
      detail: status ? `Current length: ${status.secretLength} characters.` : "Waiting for status...",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
            Security
          </h2>
          <p className="mt-2 text-sm text-white/65">
            This project uses env-based admin credentials and a signed cookie session. This page validates that setup and lets you rotate the current session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStatus()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {checks.map((check) => (
          <div
            key={check.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center gap-3">
              {check.ok ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-300" />
              )}
              <p className="text-sm font-semibold text-white">{check.label}</p>
            </div>
            <p className="mt-3 text-sm text-white/60">{check.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Current Security Model</h3>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-7 text-white/70">
            <p>
              Admin access is verified against <span className="font-semibold text-white">ADMIN_USERNAME</span> and <span className="font-semibold text-white">ADMIN_PASSWORD</span> on the server.
            </p>
            <p>
              Successful logins create an HTTP-only cookie signed from <span className="font-semibold text-white">ADMIN_SESSION_SECRET</span>, which is then checked by middleware before any admin route is served.
            </p>
            <p>
              Because credentials are env-backed by design, password rotation happens by updating environment variables and restarting the deployment, not by storing new passwords in the browser.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Recommended Env Variables</p>
            <div className="mt-3 space-y-2 text-sm text-white/78">
              <p>ADMIN_USERNAME=your-admin-username</p>
              <p>ADMIN_PASSWORD=your-strong-password</p>
              <p>ADMIN_SESSION_SECRET=at-least-16-random-characters</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Session Controls</h3>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/70">
            Use this when you want to invalidate your current admin session and force a clean re-login with the current server credentials.
          </p>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Closing Session..." : "Logout Current Session"}
          </button>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/65">
            If any of the checks on this page fail, update the missing env variable and restart the app or redeploy before attempting another login.
          </div>
        </div>
      </div>
    </motion.section>
  );
}
