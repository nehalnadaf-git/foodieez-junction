"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Tag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/data/menuData";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OfferEditor } from "@/components/admin/offers/OfferEditor";
import { OfferBadge } from "@/components/menu/OfferBadge";
import { toLegacyCatalogItems } from "@/utils/offerCompat";

const offerFilterOptions = [
  { value: "all", label: "All Offers" },
  { value: "bogo", label: "BOGO Free" },
  { value: "percentage", label: "Percentage" },
  { value: "new_tag", label: "New" },
  { value: "none", label: "No Offer" },
] as const;

export function OffersPage() {
  const { categories, menuItems } = useMenuCatalog();
  const saveCatalog = useMutation(api.menu.saveCatalog);
  const [search, setSearch] = useState("");
  const [offerFilter, setOfferFilter] = useState<(typeof offerFilterOptions)[number]["value"]>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const byCategory = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      if (needle.length > 0 && !item.name.toLowerCase().includes(needle)) {
        return false;
      }

      if (offerFilter === "all") {
        return true;
      }

      return (item.offerType ?? "none") === offerFilter;
    });
  }, [menuItems, offerFilter, search]);

  const updateItems = async (nextItems: MenuItem[]) => {
    try {
      await saveCatalog({ categories, items: nextItems });
    } catch {
      try {
        await saveCatalog({ categories, items: toLegacyCatalogItems(nextItems) as any });
      } catch {
        toast.error("Failed to sync offers with database");
      }
    }
  };

  const patchItem = (itemId: string, updater: (item: MenuItem) => MenuItem) => {
    const next = menuItems.map((item) => (item.id === itemId ? updater(item) : item));
    updateItems(next);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      <div>
        <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
          Offers & Tags
        </h2>
        <p className="mt-2 text-sm text-white/65">
          Assign one offer type per item and update percentage discounts quickly.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/45" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by item name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <Select value={offerFilter} onValueChange={(value) => setOfferFilter(value as typeof offerFilter)}>
          <SelectTrigger className="border-white/10 bg-[hsl(20,18%,7%)] text-white focus:ring-primary/40">
            <SelectValue placeholder="Filter by offer" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[hsl(20,18%,9%)] text-white">
            {offerFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="focus:bg-primary/20 focus:text-white">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-xs text-white/55">{byCategory.get(item.category) ?? item.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.offerType && item.offerType !== "none" && (
                <OfferBadge item={item} variant="inline" />
              )}
              <button
                type="button"
                onClick={() => setEditingItem(item)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)]"
              >
                <Tag className="h-3.5 w-3.5" />
                {item.offerType && item.offerType !== "none" ? "Edit Offer" : "Add Offer"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl border-white/10 bg-[hsl(20,18%,9%)] text-white">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription className="text-white/60">
              {editingItem ? `Update offer details for ${editingItem.name}.` : "Update offer details."}
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <OfferEditor
              initialOfferType={editingItem.offerType ?? "none"}
              initialOfferPercentage={editingItem.offerPercentage}
              previewPrice={Math.round(editingItem.price ?? editingItem.priceSmall ?? editingItem.priceLarge ?? 0)}
              onSave={(offer) => {
                patchItem(editingItem.id, (entry) => ({
                  ...entry,
                  offerType: offer.offerType,
                  offerPercentage: offer.offerType === "percentage" ? offer.offerPercentage : undefined,
                }));
                setEditingItem(null);
              }}
              saveLabel="Save Offer"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
