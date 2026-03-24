import type { MenuItem, OfferType } from "@/data/menuData";

export interface OfferPricing {
  originalPrice: number;
  finalPrice: number;
  quantity: number;
  billedQuantity: number;
  itemTotal: number;
  savings: number;
  offerType: OfferType;
  offerPercentage?: number;
  offerLabel: string;
}

export function normalizeOfferType(offerType?: OfferType): OfferType {
  return offerType ?? "none";
}

export function isOfferActive(offerType?: OfferType): boolean {
  return normalizeOfferType(offerType) !== "none";
}

export function getOfferLabel(item: Pick<MenuItem, "offerType" | "offerPercentage">): string {
  const offerType = normalizeOfferType(item.offerType);

  if (offerType === "bogo") {
    return "BOGO Free";
  }

  if (offerType === "percentage") {
    const percentage = Math.max(0, Math.round(item.offerPercentage ?? 0));
    return `${percentage}% Off`;
  }

  if (offerType === "new_tag") {
    return "New";
  }

  return "";
}

export function getOfferBadgeColor(offerType?: OfferType): string {
  switch (normalizeOfferType(offerType)) {
    case "bogo":
      return "bg-[#FFC200] text-black";
    case "percentage":
      return "bg-emerald-500 text-white";
    case "new_tag":
      return "bg-blue-500 text-white";
    default:
      return "bg-transparent text-transparent";
  }
}

export function calculateDiscountedPrice(originalPrice: number, offerPercentage?: number): number {
  const percentage = Math.max(0, Math.min(99, Math.round(offerPercentage ?? 0)));
  const discounted = originalPrice - (originalPrice * percentage) / 100;
  return Math.round(discounted);
}

export function getPricingForItem(
  item: Pick<MenuItem, "offerType" | "offerPercentage">,
  basePrice: number,
  quantity: number
): OfferPricing {
  const normalizedQuantity = Math.max(0, Math.round(quantity));
  const offerType = normalizeOfferType(item.offerType);
  const offerLabel = getOfferLabel(item);

  if (offerType === "bogo") {
    const safeQuantity = normalizedQuantity === 0 ? 0 : Math.max(2, normalizedQuantity + (normalizedQuantity % 2));
    const billedQuantity = safeQuantity === 0 ? 0 : safeQuantity / 2;
    const itemTotal = Math.round(basePrice * billedQuantity);
    const savings = Math.round(basePrice * billedQuantity);

    return {
      originalPrice: Math.round(basePrice),
      finalPrice: Math.round(basePrice),
      quantity: safeQuantity,
      billedQuantity,
      itemTotal,
      savings,
      offerType,
      offerPercentage: undefined,
      offerLabel,
    };
  }

  if (offerType === "percentage") {
    const finalPrice = calculateDiscountedPrice(basePrice, item.offerPercentage);
    const billedQuantity = normalizedQuantity;
    const itemTotal = Math.round(finalPrice * billedQuantity);
    const savings = Math.round((Math.round(basePrice) - finalPrice) * billedQuantity);

    return {
      originalPrice: Math.round(basePrice),
      finalPrice,
      quantity: normalizedQuantity,
      billedQuantity,
      itemTotal,
      savings,
      offerType,
      offerPercentage: Math.round(item.offerPercentage ?? 0),
      offerLabel,
    };
  }

  const billedQuantity = normalizedQuantity;
  const finalPrice = Math.round(basePrice);

  return {
    originalPrice: Math.round(basePrice),
    finalPrice,
    quantity: normalizedQuantity,
    billedQuantity,
    itemTotal: Math.round(finalPrice * billedQuantity),
    savings: 0,
    offerType,
    offerPercentage: undefined,
    offerLabel,
  };
}
