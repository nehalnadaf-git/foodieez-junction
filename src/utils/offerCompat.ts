import type { MenuItem, OfferType } from "@/data/menuData";

type LegacyOfferType = "percentage_off" | "buy_one_get_one" | "new";

interface LegacyOffer {
  type: LegacyOfferType;
  value?: number;
  customText?: string;
  active?: boolean;
  expiresAt?: string;
}

const OFFER_TYPES: OfferType[] = ["bogo", "percentage", "new_tag", "none"];

function isOfferType(value: unknown): value is OfferType {
  return typeof value === "string" && OFFER_TYPES.includes(value as OfferType);
}

function fromLegacyOffer(legacy?: LegacyOffer): {
  offerType: OfferType;
  offerPercentage?: number;
} {
  if (!legacy || legacy.active === false) {
    return { offerType: "none" };
  }

  if (legacy.type === "buy_one_get_one") {
    return { offerType: "bogo" };
  }

  if (legacy.type === "percentage_off") {
    return {
      offerType: "percentage",
      offerPercentage:
        typeof legacy.value === "number" && Number.isFinite(legacy.value)
          ? Math.round(legacy.value)
          : undefined,
    };
  }

  if (legacy.type === "new") {
    return { offerType: "new_tag" };
  }

  return { offerType: "none" };
}

export function normalizeMenuItemOffer(item: MenuItem & { offer?: LegacyOffer }): MenuItem {
  if (isOfferType(item.offerType)) {
    return item;
  }

  const normalized = fromLegacyOffer(item.offer);

  return {
    ...item,
    offerType: normalized.offerType,
    offerPercentage: normalized.offerPercentage,
  };
}

export function toLegacyOffer(item: Pick<MenuItem, "offerType" | "offerPercentage">): LegacyOffer | undefined {
  const offerType = item.offerType ?? "none";

  if (offerType === "bogo") {
    return {
      type: "buy_one_get_one",
      active: true,
    };
  }

  if (offerType === "percentage") {
    return {
      type: "percentage_off",
      value:
        typeof item.offerPercentage === "number" && Number.isFinite(item.offerPercentage)
          ? Math.round(item.offerPercentage)
          : 0,
      active: true,
    };
  }

  if (offerType === "new_tag") {
    return {
      type: "new",
      active: true,
    };
  }

  return undefined;
}

export function toLegacyCatalogItems(items: MenuItem[]): Array<Record<string, unknown>> {
  return items.map((item) => {
    const { offerType, offerPercentage, ...rest } = item;

    return {
      ...rest,
      offer: toLegacyOffer({ offerType, offerPercentage }),
    };
  });
}
