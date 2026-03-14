import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  reviews: defineTable({
    name: v.string(),
    rating: v.number(),
    reviewText: v.string(),
    status: v.string(), // "pending" | "approved"
    pinned: v.boolean(),
  }).index("by_status", ["status"]),

  categories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    imageSource: v.optional(v.union(v.literal("upload"), v.literal("url"))),
  }).index("by_categoryId", ["categoryId"]),

  menuItems: defineTable({
    itemId: v.string(),
    name: v.string(),
    category: v.string(),
    isVeg: v.boolean(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    priceSmall: v.optional(v.number()),
    priceLarge: v.optional(v.number()),
    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          price: v.number(),
        })
      )
    ),
    available: v.boolean(),
    isSpecial: v.boolean(),
    offer: v.optional(
      v.object({
        type: v.string(),
        value: v.optional(v.number()),
        customText: v.optional(v.string()),
        active: v.boolean(),
        expiresAt: v.optional(v.string()),
      })
    ),
    image: v.optional(v.string()),
    imageSource: v.optional(v.union(v.literal("upload"), v.literal("url"))),
    imageScale: v.optional(v.number()),
  }).index("by_itemId", ["itemId"]).index("by_category", ["category"]),

  orders: defineTable({
    orderId: v.string(),
    customerName: v.string(),
    orderType: v.string(), // "dine-in" | "takeaway"
    tableNumber: v.optional(v.string()),
    paymentMethod: v.string(), // "cash" | "upi"
    specialInstructions: v.optional(v.string()),
    items: v.array(
      v.object({
        name: v.string(),
        itemId: v.string(),
        size: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalAmount: v.number(),
    status: v.string(), // "pending" | "preparing" | "completed" | "cancelled"
  }).index("by_orderId", ["orderId"]).index("by_status", ["status"]),
});
