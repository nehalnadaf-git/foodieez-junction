import type { ItemOffer, OfferType } from "@/data/menuData";

/**
 * Returns true when an offer is enabled and not expired.
 */
export function isOfferActive(offer?: ItemOffer): boolean {
  if (!offer || !offer.active) {
    return false;
  }

  if (!offer.expiresAt) {
    return true;
  }

  const expiresAt = new Date(offer.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return false;
  }

  return expiresAt.getTime() > Date.now();
}

/**
 * Returns a human-readable badge label for an offer.
 */
export function getOfferLabel(offer?: ItemOffer): string {
  if (!offer) {
    return "";
  }

  switch (offer.type) {
    case "percentage_off":
      return `${Math.max(0, offer.value ?? 0)}% OFF`;
    case "buy_one_get_one":
      return "BOGO FREE";
    case "flat_discount":
      return `₹${Math.max(0, offer.value ?? 0)} OFF`;
    case "limited_time":
      return "LIMITED TIME";
    case "new_item":
      return "NEW";
    case "best_seller":
      return "BEST SELLER";
    case "today_only":
      return "TODAY ONLY";
    case "custom":
      return offer.customText?.trim() || "SPECIAL";
    default:
      return "";
  }
}

/**
 * Returns Tailwind class names for each offer badge color state.
 */
export function getOfferBadgeColor(offer?: ItemOffer): string {
  if (!offer) {
    return "bg-primary text-black shadow-[0_6px_20px_rgba(245,166,35,0.35)]";
  }

  const colorMap: Record<OfferType, string> = {
    percentage_off: "bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)]",
    buy_one_get_one: "bg-primary text-black shadow-[0_6px_20px_rgba(245,166,35,0.35)]",
    flat_discount: "bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)]",
    limited_time: "bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)]",
    new_item: "bg-emerald-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)]",
    best_seller: "bg-primary text-black shadow-[0_6px_20px_rgba(245,166,35,0.35)]",
    today_only: "bg-red-500 text-white shadow-[0_6px_20px_rgba(239,68,68,0.35)]",
    custom: "bg-primary text-black shadow-[0_6px_20px_rgba(245,166,35,0.35)]",
  };

  return colorMap[offer.type];
}

/**
 * Returns a discounted price when the offer is percentage or flat discount.
 */
export function calculateDiscountedPrice(originalPrice: number, offer?: ItemOffer): number {
  if (!offer || !isOfferActive(offer)) {
    return originalPrice;
  }

  if (offer.type === "percentage_off") {
    const percentage = Math.min(99, Math.max(1, offer.value ?? 0));
    const discounted = originalPrice - (originalPrice * percentage) / 100;
    return Math.max(0, Math.round(discounted));
  }

  if (offer.type === "flat_discount") {
    const discount = Math.max(1, offer.value ?? 0);
    return Math.max(0, originalPrice - discount);
  }

  return originalPrice;
}

/**
 * Builds one WhatsApp line item with offer annotation when applicable.
 */
export function formatOfferForWhatsApp(
  itemName: string,
  qty: number,
  originalPrice: number,
  offer?: ItemOffer
): string {
  if (!offer || !isOfferActive(offer)) {
    return `• ${itemName} x${qty} — ₹${originalPrice}`;
  }

  const label = getOfferLabel(offer);
  const discounted = calculateDiscountedPrice(originalPrice, offer);

  if (offer.type === "percentage_off" || offer.type === "flat_discount") {
    return `• ${itemName} x${qty} — ₹${discounted} (${label}, was ₹${originalPrice})`;
  }

  return `• ${itemName} x${qty} — ₹${originalPrice} (${label} 🎉)`;
}
