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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", args);
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
