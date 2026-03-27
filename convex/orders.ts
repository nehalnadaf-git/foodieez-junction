import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const submit = mutation({
  args: {
    orderId: v.string(),
    customerName: v.string(),
    orderType: v.string(),
    tableNumber: v.optional(v.string()),
    paymentMethod: v.string(),
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
    status: v.string(),
    // ─── Delivery ───────────────────────────────────────────────────────────
    deliveryAddress: v.optional(v.string()),
    deliveryMapLink: v.optional(v.string()),
    deliveryCharge: v.optional(v.number()),
    deliveryArea: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Date.now() inside a Convex mutation runs on the SERVER — never the
    // customer's device. This guarantees an accurate, tamper-proof timestamp.
    const serverTimestamp = Date.now();

    await ctx.db.insert("orders", { ...args, serverTimestamp });

    // Return the server timestamp so the client can embed it in the
    // WhatsApp pre-filled message without touching the device clock.
    return { serverTimestamp };
  },
});


export const updateStatus = mutation({
  args: { id: v.id("orders"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
