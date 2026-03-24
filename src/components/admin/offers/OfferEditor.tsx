"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { offerEditorSchema, type OfferEditorFormValues } from "@/lib/validations/offer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateDiscountedPrice } from "@/utils/offer";

interface OfferEditorProps {
  initialOfferType?: OfferEditorFormValues["offerType"];
  initialOfferPercentage?: number;
  previewPrice?: number;
  onSave: (offer: { offerType: OfferEditorFormValues["offerType"]; offerPercentage?: number }) => void;
  saveLabel?: string;
}

const options: Array<{
  value: OfferEditorFormValues["offerType"];
  title: string;
  description: string;
}> = [
  { value: "none", title: "No Offer", description: "No special pricing or tag" },
  { value: "bogo", title: "BOGO Free", description: "Customer pays for 1 and receives 2 automatically in cart." },
  { value: "percentage", title: "Percentage Discount", description: "Apply an automatic price reduction in percent." },
  { value: "new_tag", title: "New Tag", description: "Shows a New badge on the item. No price change." },
];

export function OfferEditor({
  initialOfferType = "none",
  initialOfferPercentage,
  previewPrice,
  onSave,
  saveLabel = "Save Offer",
}: OfferEditorProps) {
  const form = useForm<OfferEditorFormValues>({
    resolver: zodResolver(offerEditorSchema),
    defaultValues: {
      offerType: initialOfferType,
      offerPercentage: initialOfferPercentage,
    },
  });

  useEffect(() => {
    form.reset({
      offerType: initialOfferType,
      offerPercentage: initialOfferPercentage,
    });
  }, [form, initialOfferType, initialOfferPercentage]);

  const offerType = form.watch("offerType");
  const offerPercentage = form.watch("offerPercentage");
  const fieldError = (name: keyof OfferEditorFormValues) => form.formState.errors[name]?.message;

  const previewDiscountedPrice =
    offerType === "percentage" && typeof previewPrice === "number"
      ? calculateDiscountedPrice(previewPrice, offerPercentage)
      : null;

  const submit = form.handleSubmit((values) => {
    const payload = {
      offerType: values.offerType,
      offerPercentage: values.offerType === "percentage" ? values.offerPercentage : undefined,
    };

    onSave(payload);
    toast.success("Offer updated successfully");
  });

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div>
        <p className="text-base font-semibold text-white">Offer & Tag</p>
        <p className="mt-1 text-xs text-white/60">Assign one offer type to this item (optional)</p>
      </div>

      <RadioGroup
        value={offerType}
        onValueChange={(next) =>
          form.setValue("offerType", next as OfferEditorFormValues["offerType"], {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        className="gap-3"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[hsl(20,18%,8%)] p-3"
          >
            <RadioGroupItem value={option.value} className="mt-0.5" />
            <span>
              <span className="block text-sm font-semibold text-white">{option.title}</span>
              <span className="mt-1 block text-xs text-white/60">{option.description}</span>
            </span>
          </label>
        ))}
      </RadioGroup>

      {offerType === "percentage" && (
        <div className="space-y-2 rounded-xl border border-white/10 bg-[hsl(20,18%,8%)] p-3">
          <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-white/55">Enter %</label>
          <input
            type="number"
            min={1}
            max={99}
            value={offerPercentage ?? ""}
            onChange={(event) =>
              form.setValue("offerPercentage", event.target.value ? Number(event.target.value) : undefined, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
            placeholder="20"
          />
          {fieldError("offerPercentage") && (
            <p className="text-xs text-red-300">{fieldError("offerPercentage")}</p>
          )}
          {typeof previewPrice === "number" && previewDiscountedPrice !== null && (
            <p className="text-xs font-semibold text-emerald-300">
              Preview: Rs.{Math.round(previewPrice)} → Rs.{previewDiscountedPrice}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
      >
        {saveLabel}
      </button>
    </form>
  );
}
