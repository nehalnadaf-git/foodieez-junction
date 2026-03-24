import { describe, expect, it } from "vitest";
import { buildWhatsAppMessage } from "@/utils/whatsapp";

const baseInput = {
  orderId: "ORD-1001",
  subtotal: 330,
  totalSavings: 90,
  totalAmount: 240,
  customerName: "Nehal",
  orderType: "takeaway" as const,
  tableNumber: null,
  scannedTableNumber: null,
  paymentMethod: "cash" as const,
  estimatedTime: "20 mins",
  upiId: "nehalnadaf@ptyes",
  restaurantName: "Foodieez Junction",
};

describe("whatsapp message formatter", () => {
  it("always includes Paytm UPI payment link block even for cash", () => {
    const message = buildWhatsAppMessage({
      ...baseInput,
      items: [
        {
          itemId: "m1",
          name: "Chicken Momos",
          size: "single",
          quantity: 2,
          billedQuantity: 1,
          finalPrice: 90,
          itemTotal: 90,
          savings: 90,
          offerType: "bogo",
        },
      ],
    });

    expect(message).toContain("Payment    : Cash");
    expect(message).toContain("Pay here   : upi://pay?pa=");
    expect(message).toContain("&am=240");
  });

  it("shows only final prices and never includes struck/original wording", () => {
    const message = buildWhatsAppMessage({
      ...baseInput,
      items: [
        {
          itemId: "v1",
          name: "Veg Fried Rice",
          size: "single",
          quantity: 1,
          billedQuantity: 1,
          finalPrice: 48,
          itemTotal: 48,
          savings: 12,
          offerType: "percentage",
          offerPercentage: 20,
        },
      ],
      subtotal: 60,
      totalSavings: 12,
      totalAmount: 48,
    });

    expect(message).toContain("Offer      : 20% Off");
    expect(message).toContain("Price      : Rs.48");
    expect(message).not.toContain("Price      : Rs.60");
    expect(message).not.toContain("was");
  });

  it("keeps conditional lines strict for table, offer, and savings", () => {
    const takeawayMessage = buildWhatsAppMessage({
      ...baseInput,
      items: [
        {
          itemId: "f1",
          name: "French Fries",
          size: "single",
          quantity: 1,
          billedQuantity: 1,
          finalPrice: 50,
          itemTotal: 50,
          savings: 0,
          offerType: "new_tag",
        },
      ],
      subtotal: 50,
      totalSavings: 0,
      totalAmount: 50,
    });

    expect(takeawayMessage).not.toContain("Table No");
    expect(takeawayMessage).not.toContain("Offer      :");
    expect(takeawayMessage).not.toContain("Savings    : Rs.0");

    const dineInMessage = buildWhatsAppMessage({
      ...baseInput,
      orderType: "dine-in",
      tableNumber: "5",
      items: [
        {
          itemId: "m1",
          name: "Chicken Momos",
          size: "small",
          quantity: 2,
          billedQuantity: 1,
          finalPrice: 90,
          itemTotal: 90,
          savings: 90,
          offerType: "bogo",
        },
      ],
      subtotal: 180,
      totalSavings: 90,
      totalAmount: 90,
    });

    expect(dineInMessage).toContain("Table No   : 5");
    expect(dineInMessage).toContain("Offer      : BOGO Free");
    expect(dineInMessage).toContain("Qty        : 2 (Billed: 1)");
    expect(dineInMessage).toContain("Savings    : Rs.90");
    expect(dineInMessage).toContain("Chicken Momos (Small)");
  });

  it("contains no emoji characters and no excessive blank sections", () => {
    const message = buildWhatsAppMessage({
      ...baseInput,
      items: [
        {
          itemId: "m1",
          name: "Chicken Momos",
          size: "single",
          quantity: 2,
          billedQuantity: 1,
          finalPrice: 90,
          itemTotal: 90,
          savings: 90,
          offerType: "bogo",
        },
        {
          itemId: "v1",
          name: "Veg Fried Rice",
          size: "single",
          quantity: 1,
          billedQuantity: 1,
          finalPrice: 48,
          itemTotal: 48,
          savings: 12,
          offerType: "percentage",
          offerPercentage: 20,
        },
      ],
      subtotal: 150,
      totalSavings: 102,
      totalAmount: 138,
    });

    expect(/\p{Extended_Pictographic}/u.test(message)).toBe(false);
    expect(message).not.toContain("\n\n\n");
  });
});
