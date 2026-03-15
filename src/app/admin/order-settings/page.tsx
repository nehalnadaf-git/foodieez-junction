"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  orderSettingsSchema,
  type OrderSettingsInput,
} from "@/lib/validations/admin";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40";

export default function AdminOrderSettingsPage() {
  const { settings, patchSettings } = useAppSettings();

  const form = useForm<OrderSettingsInput>({
    resolver: zodResolver(orderSettingsSchema),
    defaultValues: settings.order,
  });

  useEffect(() => {
    form.reset(settings.order);
  }, [form, settings.order]);

  const onSubmit = (values: OrderSettingsInput) => {
    patchSettings({
      order: {
        ...settings.order,
        ...values,
      },
    });

    toast.success("Order settings saved");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
        Order Settings
      </h2>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Dine-In WhatsApp Number
            </label>
            <input {...form.register("dineInWhatsappNumber")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Takeaway WhatsApp Number
            </label>
            <input {...form.register("takeawayWhatsappNumber")} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Open Time (IST)
            </label>
            <input type="time" {...form.register("openTimeIst")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Close Time (IST)
            </label>
            <input type="time" {...form.register("closeTimeIst")} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Estimated Wait Time
            </label>
            <input {...form.register("estimatedWaitTime")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Order ID Prefix
            </label>
            <input {...form.register("orderIdPrefix")} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">
              Max Quantity Per Item
            </label>
            <input
              type="number"
              min={1}
              {...form.register("maxQuantityPerItem", { valueAsNumber: true })}
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
        >
          Save Settings
        </button>
      </form>
    </motion.section>
  );
}
