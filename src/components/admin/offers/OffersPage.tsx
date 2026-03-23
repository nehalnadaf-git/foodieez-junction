"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Tag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import type { ItemOffer, MenuItem } from "@/data/menuData";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isOfferActive } from "@/utils/offer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { OfferEditor } from "@/components/admin/offers/OfferEditor";
import { OfferCard } from "@/components/admin/offers/OfferCard";
import { BulkActions } from "@/components/admin/offers/BulkActions";
import { OfferBadge } from "@/components/menu/OfferBadge";

const offerFilterOptions = [
  { value: "all", label: "All Offers" },
  { value: "percentage_off", label: "Percentage Off" },
  { value: "buy_one_get_one", label: "Buy One Get One" },
  { value: "new", label: "New" },
] as const;

export function OffersPage() {
  const { categories, menuItems } = useMenuCatalog();
  const saveCatalog = useMutation(api.menu.saveCatalog);
  const [search, setSearch] = useState("");
  const [offerFilter, setOfferFilter] = useState<(typeof offerFilterOptions)[number]["value"]>("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [removingItem, setRemovingItem] = useState<MenuItem | null>(null);

  const byCategory = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const activeOffers = useMemo(
    () => menuItems.filter((item) => item.offer && isOfferActive(item.offer)),
    [menuItems]
  );

  const itemsForAllTab = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      if (needle.length > 0 && !item.name.toLowerCase().includes(needle)) {
        return false;
      }

      if (offerFilter === "all") {
        return true;
      }

      return item.offer?.type === offerFilter;
    });
  }, [menuItems, offerFilter, search]);

  const withOffer = useMemo(() => menuItems.filter((item) => item.offer), [menuItems]);
  const canActivateAll = withOffer.some((item) => item.offer && !item.offer.active);
  const canDeactivateAll = withOffer.some((item) => item.offer?.active);

  const updateItems = async (nextItems: MenuItem[]) => {
    try {
      await saveCatalog({ categories, items: nextItems });
    } catch {
      toast.error("Failed to sync offers with database");
    }
  };

  const patchItem = (itemId: string, updater: (item: MenuItem) => MenuItem) => {
    const next = menuItems.map((item) => (item.id === itemId ? updater(item) : item));
    updateItems(next);
  };

  const upsertOffer = (itemId: string, offer: ItemOffer | undefined) => {
    patchItem(itemId, (item) => ({ ...item, offer }));
    toast.success(offer ? "Offer updated" : "Offer removed");
    setEditingItem(null);
  };

  const handleActivateAll = () => {
    const next = menuItems.map((item) =>
      item.offer ? { ...item, offer: { ...item.offer, active: true } } : item
    );
    updateItems(next);
    toast.success("All offers activated");
  };

  const handleDeactivateAll = () => {
    const next = menuItems.map((item) =>
      item.offer ? { ...item, offer: { ...item.offer, active: false } } : item
    );
    updateItems(next);
    toast.success("All offers deactivated");
  };

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
            Offers & Discounts
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Control every menu offer from one place with quick edits and bulk actions.
          </p>
        </div>

        <BulkActions
          canActivate={canActivateAll}
          canDeactivate={canDeactivateAll}
          onActivateAll={handleActivateAll}
          onDeactivateAll={handleDeactivateAll}
        />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1 lg:w-[360px]">
          <TabsTrigger
            value="active"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"
          >
            Active Offers
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"
          >
            All Items
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOffers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
              No active offers right now. Add offers from Menu Management.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeOffers.map((item) => (
                <OfferCard
                  key={item.id}
                  item={item}
                  onToggleActive={(itemId, active) => {
                    patchItem(itemId, (entry) => ({
                      ...entry,
                      offer: entry.offer ? { ...entry.offer, active } : entry.offer,
                    }));
                    toast.success(active ? "Offer activated" : "Offer deactivated");
                  }}
                  onEdit={(entry) => setEditingItem(entry)}
                  onRemove={(entry) => setRemovingItem(entry)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
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
            {itemsForAllTab.map((item) => {
              const status = !item.offer
                ? "No Offer"
                : isOfferActive(item.offer)
                  ? "Active"
                  : item.offer.active
                    ? "Expired"
                    : "Inactive";

              return (
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
                      <p className="mt-1 text-xs font-semibold text-primary">{status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.offer && (
                      <div className="relative h-9 w-36 rounded-lg border border-white/10 bg-black/20">
                        <OfferBadge offer={item.offer} />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,166,35,0.45)]"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {item.offer ? "Edit Offer" : "Add Offer"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

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
              initialOffer={editingItem.offer}
              onSave={(offer) => upsertOffer(editingItem.id, offer)}
              saveLabel="Save Offer"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(removingItem)} onOpenChange={(open) => !open && setRemovingItem(null)}>
        <AlertDialogContent className="border-white/10 bg-[hsl(20,18%,9%)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove offer?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {removingItem
                ? `This will clear the offer from ${removingItem.name}.`
                : "This will clear the offer from the selected item."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-500/90"
              onClick={() => {
                if (!removingItem) {
                  return;
                }
                patchItem(removingItem.id, (item) => ({ ...item, offer: undefined }));
                toast.success("Offer removed");
                setRemovingItem(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}
