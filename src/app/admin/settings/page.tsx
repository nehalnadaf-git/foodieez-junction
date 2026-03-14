"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppSettings } from "@/context/AppSettingsContext";
import { SocialMediaLinks } from "@/components/admin/settings/SocialMediaLinks";

type SettingsFormValues = {
  restaurantAddress: string;
  googleMapsLink: string;
  googleReviewLink: string;
  baseDomain: string;
  currencySymbol: string;
  maintenanceMode: boolean;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40";

export default function AdminSettingsPage() {
  const { settings, patchSettings } = useAppSettings();

  const form = useForm<SettingsFormValues>({
    defaultValues: settings.restaurant,
  });

  useEffect(() => {
    form.reset(settings.restaurant);
  }, [form, settings.restaurant]);

  const onSubmit = (values: SettingsFormValues) => {
    patchSettings({
      restaurant: {
        ...settings.restaurant,
        ...values,
      },
    });

    toast.success("Restaurant settings saved");
  };

  const maintenanceMode = form.watch("maintenanceMode");

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
        Settings
      </h2>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Currency Symbol</label>
            <input {...form.register("currencySymbol")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Website Domain</label>
            <input {...form.register("baseDomain")} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Restaurant Address</label>
          <input {...form.register("restaurantAddress")} className={inputClass} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Google Maps Link</label>
            <input {...form.register("googleMapsLink")} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/70">Google Review Link</label>
            <input {...form.register("googleReviewLink")} className={inputClass} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => form.setValue("maintenanceMode", !maintenanceMode)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${maintenanceMode ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-white/70"}`}
        >
          Maintenance Mode: {maintenanceMode ? "On" : "Off"}
        </button>

        <div>
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
          >
            Save Settings
          </button>
        </div>
      </form>

      <SocialMediaLinks />
    </motion.section>
  );
}
