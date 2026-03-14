import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

export const submit = mutation({
  args: {
    name: v.string(),
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reviews", {
      name: args.name,
      rating: args.rating,
      reviewText: args.reviewText,
      status: "pending",
      pinned: false,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const togglePinned = mutation({
  args: {
    id: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (review) {
      await ctx.db.patch(args.id, { pinned: !review.pinned });
    }
  },
});

export const remove = mutation({
  args: {
    id: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
