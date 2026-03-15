"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  categories as defaultCategories,
  menuItems as defaultMenuItems,
  type Category,
  type ItemOffer,
  type MenuItem,
} from "@/data/menuData";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageUploader } from "@/components/admin/menu/ImageUploader";
import { OfferEditor } from "@/components/admin/offers/OfferEditor";
import { getOfferLabel } from "@/utils/offer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryFormState {
  id: string;
  name: string;
  image: string;
  imageSource?: "upload" | "url";
}

interface ItemFormState {
  id: string;
  name: string;
  category: string;
  isVeg: boolean;
  available: boolean;
  isSpecial: boolean;
  description: string;
  image?: string;
  imageSource?: "upload" | "url";
  priceMode: "single" | "split";
  price: string;
  priceSmall: string;
  priceLarge: string;
  imageScale: string;
  offer?: ItemOffer;
}

const emptyCategoryForm: CategoryFormState = {
  id: "",
  name: "",
  image: "",
  imageSource: undefined,
};

const emptyItemForm: ItemFormState = {
  id: "",
  name: "",
  category: "",
  isVeg: true,
  available: true,
  isSpecial: false,
  description: "",
  image: undefined,
  imageSource: undefined,
  priceMode: "single",
  price: "",
  priceSmall: "",
  priceLarge: "",
  imageScale: "",
  offer: undefined,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function createMenuItemId(name: string): string {
  const slug = slugify(name) || "item";
  return `${slug}-${Date.now().toString(36)}`;
}

function getItemPriceLabel(item: MenuItem): string {
  if (item.priceSmall && item.priceLarge) {
    return `S ₹${item.priceSmall} • L ₹${item.priceLarge}`;
  }

  return `₹${item.price ?? 0}`;
}

function toCategoryForm(category: Category): CategoryFormState {
  return {
    id: category.id,
    name: category.name,
    image: category.image,
    imageSource: (category as any).imageSource,
  };
}

function toItemForm(item: MenuItem): ItemFormState {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    isVeg: item.isVeg,
    available: item.available ?? true,
    isSpecial: item.isSpecial ?? false,
    description: item.description ?? "",
    image: item.image,
    imageSource: item.imageSource,
    priceMode: item.priceSmall && item.priceLarge ? "split" : "single",
    price: item.price?.toString() ?? "",
    priceSmall: item.priceSmall?.toString() ?? "",
    priceLarge: item.priceLarge?.toString() ?? "",
    imageScale: item.imageScale?.toString() ?? "",
    offer: item.offer,
  };
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);

  const categoryFormRef = useRef<HTMLDivElement>(null);
  const itemFormRef = useRef<HTMLDivElement>(null);

  const catalog = useQuery(api.menu.getCatalog);
  const saveCatalog = useMutation(api.menu.saveCatalog);

  useEffect(() => {
    if (catalog && !isLoaded) {
      let { categories: dbCategories, items: dbItems } = catalog;
      if (dbCategories.length === 0 && dbItems.length === 0) {
        dbCategories = defaultCategories as any;
        dbItems = defaultMenuItems as any;
      }
      setCategories(dbCategories as any);
      setItems(dbItems as any);
      setIsLoaded(true);
    }
  }, [catalog, isLoaded]);

  // ── All hooks must be called before any early return ──
  const groupedItems = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: items.filter((item) => item.category === category.id),
      })),
    [categories, items]
  );

  useEffect(() => {
    if (categories.length > 0 && !itemForm.category) {
      setItemForm((current) => ({ ...current, category: categories[0].id }));
    }
  }, [categories, itemForm.category]);

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 animate-pulse">
        <p className="text-white/40 font-accent uppercase tracking-widest text-sm">
          Initializing Menu Manager...
        </p>
      </div>
    );
  }

  const persistCatalog = async (nextCategories: Category[], nextItems: MenuItem[]) => {
    setCategories(nextCategories);
    setItems(nextItems);
    try {
      await saveCatalog({ categories: nextCategories, items: nextItems });
    } catch (err) {
      toast.error("Failed to sync with database");
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const resetItemForm = () => {
    setItemForm({
      ...emptyItemForm,
      category: categories[0]?.id ?? "",
    });
    setEditingItemId(null);
  };

  const handleCategorySubmit = () => {
    const trimmedName = categoryForm.name.trim();
    const trimmedImage = categoryForm.image?.trim();

    if (!trimmedName || !trimmedImage) {
      toast.error("Category name and image are required");
      return;
    }

    const nextId = editingCategoryId ?? slugify(categoryForm.id || trimmedName);
    if (!nextId) {
      toast.error("Unable to generate a category id");
      return;
    }

    const duplicate = categories.find(
      (category) => category.id === nextId && category.id !== editingCategoryId
    );

    if (duplicate) {
      toast.error("Category id already exists. Pick a different name or id.");
      return;
    }

    const nextCategory: Category = {
      id: nextId,
      name: trimmedName,
      image: trimmedImage,
      imageSource: categoryForm.imageSource,
    } as any;

    if (editingCategoryId) {
      const nextCategories = categories.map((category) =>
        category.id === editingCategoryId ? nextCategory : category
      );
      const nextItems = items.map((item) =>
        item.category === editingCategoryId ? { ...item, category: nextId } : item
      );
      persistCatalog(nextCategories, nextItems);
      toast.success("Category updated");
    } else {
      persistCatalog([...categories, nextCategory], items);
      toast.success("Category added");
    }

    resetCategoryForm();
  };

  const handleItemSubmit = () => {
    const trimmedName = itemForm.name.trim();
    const trimmedImage = itemForm.image?.trim();
    const trimmedDescription = itemForm.description.trim();

    if (!trimmedName || !itemForm.category) {
      toast.error("Item name and category are required");
      return;
    }

    const price = itemForm.priceMode === "single" ? Number(itemForm.price) : undefined;
    const priceSmall = itemForm.priceMode === "split" ? Number(itemForm.priceSmall) : undefined;
    const priceLarge = itemForm.priceMode === "split" ? Number(itemForm.priceLarge) : undefined;
    const imageScale = itemForm.imageScale ? Number(itemForm.imageScale) : undefined;

    if (
      (itemForm.priceMode === "single" && (!price || Number.isNaN(price) || price <= 0)) ||
      (itemForm.priceMode === "split" &&
        (!priceSmall || !priceLarge || Number.isNaN(priceSmall) || Number.isNaN(priceLarge)))
    ) {
      toast.error("Enter valid pricing before saving the menu item");
      return;
    }

    const nextItem: MenuItem = {
      id: editingItemId ?? createMenuItemId(trimmedName),
      name: trimmedName,
      category: itemForm.category,
      isVeg: itemForm.isVeg,
      available: itemForm.available,
      isSpecial: itemForm.isSpecial,
      description: trimmedDescription || undefined,
      image: trimmedImage || undefined,
      imageSource: itemForm.imageSource,
      offer: itemForm.offer,
      price: itemForm.priceMode === "single" ? price : undefined,
      priceSmall: itemForm.priceMode === "split" ? priceSmall : undefined,
      priceLarge: itemForm.priceMode === "split" ? priceLarge : undefined,
      imageScale: imageScale && !Number.isNaN(imageScale) ? imageScale : undefined,
      sizes: (items.find(i => i.id === editingItemId) || {}).sizes,
    };

    const nextItems = editingItemId
      ? items.map((item) => (item.id === editingItemId ? nextItem : item))
      : [...items, nextItem];

    persistCatalog(categories, nextItems);
    toast.success(editingItemId ? "Menu item updated" : "Menu item added");
    resetItemForm();
  };

  const handleDeleteCategory = (category: Category) => {
    const linkedItems = items.filter((item) => item.category === category.id);
    if (linkedItems.length > 0) {
      toast.error("Delete or move the items in this category first");
      return;
    }

    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    persistCatalog(
      categories.filter((entry) => entry.id !== categoryToDelete.id),
      items
    );
    if (editingCategoryId === categoryToDelete.id) {
      resetCategoryForm();
    }
    toast.success("Category deleted");
    setCategoryToDelete(null);
  };

  const handleDeleteItem = (itemId: string) => {
    persistCatalog(
      categories,
      items.filter((item) => item.id !== itemId)
    );
    if (editingItemId === itemId) {
      resetItemForm();
    }
    toast.success("Menu item deleted");
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm("Reset the entire menu catalog back to the default menu?");
    if (!confirmed) {
      return;
    }

    persistCatalog(defaultCategories, defaultMenuItems);
    resetCategoryForm();
    resetItemForm();
    toast.success("Menu catalog reset to defaults");
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
            Menu Management
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Manage categories, pricing, product images, and offer tags from LocalStorage-backed admin state.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-primary/30 hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Categories</p>
          <p className="mt-3 text-4xl font-bold text-primary">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Menu Items</p>
          <p className="mt-3 text-4xl font-bold text-primary">{items.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div ref={categoryFormRef} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {editingCategoryId ? "Edit Category" : "Add Category"}
              </h3>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="text-sm font-semibold text-white/60 transition-colors hover:text-primary"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Name</label>
                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                  placeholder="Momos"
                />
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">ID</label>
                  <input
                    value={categoryForm.id}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, id: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="auto from name"
                    disabled={Boolean(editingCategoryId)}
                  />
                </div>
              </div>
              <ImageUploader
                image={categoryForm.image}
                imageSource={categoryForm.imageSource}
                onChange={(image, source) => setCategoryForm((current) => ({ ...current, image: image ?? "", imageSource: source }))}
              />
              <button
                type="button"
                onClick={handleCategorySubmit}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
              >
                {editingCategoryId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCategoryId ? "Save Category" : "Add Category"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-white">Category List</h3>
            <div className="mt-4 space-y-3">
              {categories.map((category) => {
                const count = items.filter((item) => item.category === category.id).length;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-black/20">
                        {category.image ? (
                          <img src={category.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-white/20">NO IMG</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {category.name}
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          {category.id} • {count} items
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryForm(toCategoryForm(category));
                          categoryFormRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-white/75 transition-colors hover:border-primary/30 hover:text-primary"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category)}
                        className="rounded-full border border-red-400/30 bg-red-500/10 p-2 text-red-300 transition-colors hover:bg-red-500/20"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div ref={itemFormRef} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {editingItemId ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              {editingItemId && (
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="text-sm font-semibold text-white/60 transition-colors hover:text-primary"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Name</label>
                  <input
                    value={itemForm.name}
                    onChange={(event) => setItemForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="Chicken Fried Rice"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(event) => setItemForm((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[hsl(20,18%,7%)] px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setItemForm((current) => ({ ...current, priceMode: "single" }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${itemForm.priceMode === "single" ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/70"}`}
                >
                  Single Price
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((current) => ({ ...current, priceMode: "split" }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${itemForm.priceMode === "split" ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/70"}`}
                >
                  Small / Large
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((current) => ({ ...current, isVeg: !current.isVeg }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${itemForm.isVeg ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}
                >
                  {itemForm.isVeg ? "Veg" : "Non-Veg"}
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((current) => ({ ...current, available: !current.available }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${itemForm.available ? "bg-primary/20 text-primary" : "border border-white/10 bg-white/5 text-white/70"}`}
                >
                  {itemForm.available ? "Available" : "Unavailable"}
                </button>
                <button
                  type="button"
                  onClick={() => setItemForm((current) => ({ ...current, isSpecial: !current.isSpecial }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${itemForm.isSpecial ? "bg-primary text-black" : "border border-white/10 bg-white/5 text-white/70"}`}
                >
                  {itemForm.isSpecial ? "Special" : "Mark Special"}
                </button>
              </div>

              {itemForm.priceMode === "single" ? (
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Price</label>
                  <input
                    value={itemForm.price}
                    onChange={(event) => setItemForm((current) => ({ ...current, price: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="80"
                    inputMode="numeric"
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Small Price</label>
                    <input
                      value={itemForm.priceSmall}
                      onChange={(event) => setItemForm((current) => ({ ...current, priceSmall: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                      placeholder="40"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Large Price</label>
                    <input
                      value={itemForm.priceLarge}
                      onChange={(event) => setItemForm((current) => ({ ...current, priceLarge: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                      placeholder="60"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Image Scale</label>
                <input
                  value={itemForm.imageScale}
                  onChange={(event) => setItemForm((current) => ({ ...current, imageScale: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                  placeholder="Optional, e.g. 1.12"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.22em] text-white/50">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(event) => setItemForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/40"
                  placeholder="Optional short description for the item"
                />
              </div>

              <ImageUploader
                image={itemForm.image}
                imageSource={itemForm.imageSource}
                onChange={(image, source) => setItemForm((current) => ({ ...current, image, imageSource: source }))}
              />

              <Accordion type="single" collapsible className="rounded-2xl border border-white/10 bg-white/5 px-4">
                <AccordionItem value="offer" className="border-none">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-white hover:no-underline">
                    Offer & Discount
                  </AccordionTrigger>
                  <AccordionContent>
                    <OfferEditor
                      initialOffer={itemForm.offer}
                      onSave={(offer) => setItemForm((current) => ({ ...current, offer }))}
                      saveLabel="Apply Offer"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <button
                type="button"
                onClick={handleItemSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition-all duration-200 hover:shadow-[0_0_24px_rgba(245,166,35,0.45)]"
              >
                {editingItemId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingItemId ? "Save Menu Item" : "Add Menu Item"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-white">Menu Catalog</h3>
            <div className="mt-5 space-y-5">
              {groupedItems.map(({ category, items: categoryItems }) => (
                <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">
                        {category.name}
                      </h4>
                      <p className="mt-1 text-xs text-white/50">{categoryItems.length} items</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {categoryItems.length > 0 ? (
                      categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(245,166,35,0.08),rgba(255,255,255,0.04))] p-4 md:flex-row md:items-start md:justify-between"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt="" 
                                    className="h-full w-full object-cover" 
                                    style={{ transform: item.imageScale ? `scale(${item.imageScale})` : undefined }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-white/20 uppercase">No Img</div>
                                )}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-white">{item.name}</p>
                                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.isVeg ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                                    {item.isVeg ? "Veg" : "Non-Veg"}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.available ? "bg-primary/20 text-primary" : "bg-zinc-500/20 text-zinc-300"}`}>
                                    {item.available ? "Available" : "Unavailable"}
                                  </span>
                                  {item.isSpecial && (
                                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                                      Special
                                    </span>
                                  )}
                                  {item.offer && (
                                    <span className="rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                      {getOfferLabel(item.offer)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-sm text-white/65">{getItemPriceLabel(item)}</p>
                                {item.image && <p className="mt-1 text-[10px] text-white/35 truncate max-w-[200px]">{item.image}</p>}
                                {item.description && (
                                  <p className="mt-2 text-sm leading-6 text-white/65">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 md:justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setItemForm(toItemForm(item));
                                itemFormRef.current?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/75 transition-colors hover:border-primary/30 hover:text-primary"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="rounded-full border border-red-400/30 bg-red-500/10 p-2 text-red-300 transition-colors hover:bg-red-500/20"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/55">
                        No items in this category yet.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="border-white/10 bg-[hsl(20,18%,7%)] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete the category <span className="font-bold text-primary">"{categoryToDelete?.name}"</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.section>
  );
}
