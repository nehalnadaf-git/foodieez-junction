import { describe, expect, it } from "vitest";
import { getOfferLabel, getPricingForItem } from "@/utils/offer";

describe("offer pricing utilities", () => {
  it("calculates BOGO pricing with billed quantity and savings", () => {
    const priced = getPricingForItem(
      { offerType: "bogo" },
      90,
      2
    );

    expect(priced.offerLabel).toBe("BOGO Free");
    expect(priced.quantity).toBe(2);
    expect(priced.billedQuantity).toBe(1);
    expect(priced.finalPrice).toBe(90);
    expect(priced.itemTotal).toBe(90);
    expect(priced.savings).toBe(90);
  });

  it("keeps BOGO quantities even and scales billed quantity", () => {
    const priced = getPricingForItem(
      { offerType: "bogo" },
      120,
      5
    );

    expect(priced.quantity % 2).toBe(0);
    expect(priced.quantity).toBe(6);
    expect(priced.billedQuantity).toBe(3);
    expect(priced.itemTotal).toBe(360);
    expect(priced.savings).toBe(360);
  });

  it("calculates percentage offer across quantities", () => {
    const priced = getPricingForItem(
      { offerType: "percentage", offerPercentage: 20 },
      60,
      3
    );

    expect(priced.offerLabel).toBe("20% Off");
    expect(priced.finalPrice).toBe(48);
    expect(priced.billedQuantity).toBe(3);
    expect(priced.itemTotal).toBe(144);
    expect(priced.savings).toBe(36);
  });

  it("does not apply price changes for new tag", () => {
    const priced = getPricingForItem(
      { offerType: "new_tag" },
      50,
      2
    );

    expect(priced.offerLabel).toBe("New");
    expect(priced.finalPrice).toBe(50);
    expect(priced.itemTotal).toBe(100);
    expect(priced.savings).toBe(0);
  });

  it("returns expected labels for each offer type", () => {
    expect(getOfferLabel({ offerType: "none" })).toBe("");
    expect(getOfferLabel({ offerType: "bogo" })).toBe("BOGO Free");
    expect(getOfferLabel({ offerType: "percentage", offerPercentage: 15 })).toBe("15% Off");
    expect(getOfferLabel({ offerType: "new_tag" })).toBe("New");
  });
});
