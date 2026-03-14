"use client";

import Image from "next/image";
import { Clock3, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/data/menuData";
import { Switch } from "@/components/ui/switch";
import { OfferBadge } from "@/components/menu/OfferBadge";
import { getOfferLabel } from "@/utils/offer";

interface OfferCardProps {
  item: MenuItem;
  onToggleActive: (itemId: string, active: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
}

export function OfferCard({ item, onToggleActive, onEdit, onRemove }: OfferCardProps) {
  const offer = item.offer;
  if (!offer) {
    return null;
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-xs text-white/55">{item.category}</p>
            <div className="relative mt-2 h-9 w-44 rounded-lg border border-white/10 bg-black/20">
              <OfferBadge offer={offer} />
            </div>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-white/75 md:text-right">
          <p className="font-semibold text-white/90">{getOfferLabel(offer)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-white/55 md:justify-end">
            <Clock3 className="h-3.5 w-3.5" />
            {offer.expiresAt ? new Date(offer.expiresAt).toLocaleString() : "No Expiry"}
          </p>
          <div className="inline-flex items-center gap-2 md:justify-end">
            <Switch
              checked={offer.active}
              onCheckedChange={(checked) => onToggleActive(item.id, checked)}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-xs uppercase tracking-[0.15em] text-white/50">
              {offer.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Quick Edit
        </button>
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Offer
        </button>
      </div>
    </article>
  );
}
