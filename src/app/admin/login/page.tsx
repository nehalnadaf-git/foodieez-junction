"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: AdminLoginInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        toast.error(result.error ?? "Unable to login");
        return;
      }

      toast.success("Login successful");
      router.replace("/admin");
    } catch {
      toast.error("Something went wrong while logging in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[hsl(20,18%,5%)] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,166,35,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(196,123,5,0.08),transparent_35%)]" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto mt-20 w-full max-w-md rounded-2xl border border-white/10 bg-black/35 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <h1 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-center text-3xl font-bold text-transparent">
          Foodieez Junction
        </h1>
        <p className="mt-2 text-center text-sm text-white/60">Admin Login</p>

        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Username
            </label>
            <input
              {...form.register("username")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
              placeholder="Admin username"
            />
            {form.formState.errors.username && (
              <p className="mt-1 text-xs text-red-300">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Password
            </label>
            <input
              type="password"
              {...form.register("password")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
              placeholder="Password"
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-300">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>
      </motion.section>
    </main>
  );
}
