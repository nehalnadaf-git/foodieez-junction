import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULTS: Record<string, string> = {
  "order.dineInWhatsappNumber": "+91 9743862836",
  "order.takeawayWhatsappNumber": "+91 9743862836",
  "order.openTimeIst": "14:00",
  "order.closeTimeIst": "23:00",
  "order.estimatedWaitTime": "15-20 mins",
  "order.orderIdPrefix": "FJ",
  "order.minimumOrderValue": "80",
  "order.maxQuantityPerItem": "10",
  "upi.upiId": "nehalnadaf@ptyes",
  "upi.enableCash": "true",
  "upi.enableUpi": "true",
  "restaurant.restaurantName": "Foodieez Junction",
  "restaurant.restaurantAddress": "Bengeri/Vidya Nagar, Hubballi, Karnataka",
  "restaurant.googleMapsLink": "",
  "restaurant.googleReviewLink": "https://search.google.com/local/writereview",
  "restaurant.baseDomain": "https://foodieezjunction.com",
  "restaurant.currencySymbol": "₹",
  "restaurant.maintenanceMode": "false",
  "reviews.showReviewsOnHome": "true",
};

export const getAll = query({
  args: {},
  handler: async ({ db }) => {
    const rows = await db.query("appSettings").collect();
    // Merge stored values on top of defaults
    const merged: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      merged[row.key] = row.value;
    }
    return merged;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async ({ db }, { key, value }) => {
    const existing = await db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (existing) {
      await db.patch(existing._id, { value });
    } else {
      await db.insert("appSettings", { key, value });
    }
  },
});

export const setMany = mutation({
  args: {
    settings: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async ({ db }, { settings }) => {
    for (const { key, value } of settings) {
      const existing = await db
        .query("appSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      if (existing) {
        await db.patch(existing._id, { value });
      } else {
        await db.insert("appSettings", { key, value });
      }
    }
  },
});
