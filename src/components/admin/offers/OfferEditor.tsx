"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ItemOffer } from "@/data/menuData";
import { OfferBadge } from "@/components/menu/OfferBadge";
import { offerEditorSchema, type OfferEditorFormValues } from "@/lib/validations/offer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface OfferEditorProps {
  initialOffer?: ItemOffer;
  onSave: (offer: ItemOffer | undefined) => void;
  saveLabel?: string;
}

const offerTypeOptions: Array<{ value: OfferEditorFormValues["type"]; label: string }> = [
  { value: "percentage_off", label: "Percentage Offer" },
  { value: "buy_one_get_one", label: "Buy One, Get One Free Offer" },
  { value: "new", label: "New" },
];

export function OfferEditor({ initialOffer, onSave, saveLabel = "Save Offer" }: OfferEditorProps) {
  const validTypes = ["percentage_off", "buy_one_get_one"] as const;
  const isValidType = (type: any): type is typeof validTypes[number] => validTypes.includes(type);
  
  const form = useForm<OfferEditorFormValues>({
    resolver: zodResolver(offerEditorSchema),
    defaultValues: {
      type: initialOffer?.type && isValidType(initialOffer.type) ? initialOffer.type : "percentage_off",
      value: initialOffer?.value,
      customText: initialOffer?.customText ?? "",
      active: initialOffer?.active ?? true,
      expiresAt: initialOffer?.expiresAt
        ? new Date(initialOffer.expiresAt).toISOString().slice(0, 16)
        : "",
    },
  });

  useEffect(() => {
    const validTypes = ["percentage_off", "buy_one_get_one"] as const;
    const isValidType = (type: any): type is typeof validTypes[number] => validTypes.includes(type);
    
    form.reset({
      type: initialOffer?.type && isValidType(initialOffer.type) ? initialOffer.type : "percentage_off",
      value: initialOffer?.value,
      customText: initialOffer?.customText ?? "",
      active: initialOffer?.active ?? true,
      expiresAt: initialOffer?.expiresAt
        ? new Date(initialOffer.expiresAt).toISOString().slice(0, 16)
        : "",
    });
  }, [form, initialOffer]);

  const selectedType = form.watch("type");
  const value = form.watch("value");
  const customText = form.watch("customText");
  const active = form.watch("active");
  const expiresAt = form.watch("expiresAt");

  useEffect(() => {
    if (!form.getValues("active")) {
      form.setValue("active", true, { shouldDirty: true });
    }
  }, [form, selectedType]);

  const previewOffer = useMemo<ItemOffer | undefined>(() => {
    return {
      type: selectedType,
      value: value,
      customText: customText?.trim() || undefined,
      active,
      expiresAt: expiresAt?.trim() ? new Date(expiresAt).toISOString() : undefined,
    };
  }, [active, customText, expiresAt, selectedType, value]);

  const submit = form.handleSubmit((values) => {
    const payload: ItemOffer = {
      type: values.type,
      value: values.value,
      customText: values.customText?.trim() || undefined,
      active: values.active,
      expiresAt: values.expiresAt?.trim() ? new Date(values.expiresAt).toISOString() : undefined,
    };

    onSave(payload);
    toast.success("Offer saved");
  });

  const fieldError = (name: keyof OfferEditorFormValues) => form.formState.errors[name]?.message;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Offer Type</label>
        <Select
          value={selectedType}
          onValueChange={(next) => form.setValue("type", next as OfferEditorFormValues["type"], { shouldDirty: true })}
        >
          <SelectTrigger className="border-white/10 bg-[hsl(20,18%,7%)] text-white focus:ring-primary/40">
            <SelectValue placeholder="Select offer type" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[hsl(20,18%,9%)] text-white">
            {offerTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="focus:bg-primary/20 focus:text-white">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType === "percentage_off" && (
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Percentage Value</label>
          <input
            type="number"
            min={1}
            max={99}
            value={value ?? ""}
            onChange={(event) =>
              form.setValue("value", event.target.value ? Number(event.target.value) : undefined, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
            placeholder="50"
          />
          {fieldError("value") && <p className="mt-1 text-xs text-red-300">{fieldError("value")}</p>}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Offer Active</label>
          <div className="flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-3">
            <Switch
              checked={active}
              onCheckedChange={(checked) => form.setValue("active", checked, { shouldDirty: true })}
              className="data-[state=checked]:bg-primary"
            />
            <span className="ml-3 text-sm text-white/80">{active ? "On" : "Off"}</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Expiry Date & Time</label>
          <input
            type="datetime-local"
            value={expiresAt ?? ""}
            onChange={(event) =>
              form.setValue("expiresAt", event.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          <p className="mt-1 text-xs text-white/45">Leave empty for no expiry</p>
          {fieldError("expiresAt") && <p className="mt-1 text-xs text-red-300">{fieldError("expiresAt")}</p>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">Badge Preview</p>
        <div className="relative h-12 rounded-lg border border-white/10 bg-black/20">
          <OfferBadge offer={previewOffer} />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
      >
        {saveLabel}
      </button>
    </form>
  );
}
