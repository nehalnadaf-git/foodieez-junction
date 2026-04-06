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
    order: v.optional(v.number()),
    visible: v.optional(v.boolean()),
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
    offerType: v.optional(
      v.union(
        v.literal("bogo"),
        v.literal("percentage"),
        v.literal("new_tag"),
        v.literal("none")
      )
    ),
    offerPercentage: v.optional(v.number()),
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
    serverTimestamp: v.optional(v.number()), // server-side Date.now() for accurate order time
    customerPhone: v.optional(v.string()),
    deliveryCharge: v.optional(v.number()),
    deliveryAddress: v.optional(v.string()),
    deliveryMapLink: v.optional(v.string()),
    deliveryArea: v.optional(v.string()),
  }).index("by_orderId", ["orderId"]).index("by_status", ["status"]),

  // ── NEW TABLES (localStorage → Convex migration) ──

  appSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  restaurantStatus: defineTable({
    isOpen: v.boolean(),
    manualOverride: v.boolean(),
    closedMessage: v.string(),
    updatedAt: v.number(),
  }),

  socialLinks: defineTable({
    platform: v.string(),
    url: v.string(),
    active: v.boolean(),
  }).index("by_platform", ["platform"]),

  restaurantTables: defineTable({
    tableId: v.string(),
    name: v.string(),
    number: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_tableId", ["tableId"]).index("by_number", ["number"]),
});
