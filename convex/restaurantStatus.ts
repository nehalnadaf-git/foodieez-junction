import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT = {
  isOpen: true,
  manualOverride: false,
  closedMessage: "We are currently closed. We will be back soon!",
};

export const get = query({
  args: {},
  handler: async ({ db }) => {
    const row = await db.query("restaurantStatus").first();
    return row ?? { ...DEFAULT, _id: undefined, _creationTime: undefined };
  },
});

export const update = mutation({
  args: {
    isOpen: v.optional(v.boolean()),
    manualOverride: v.optional(v.boolean()),
    closedMessage: v.optional(v.string()),
  },
  handler: async ({ db }, args) => {
    const existing = await db.query("restaurantStatus").first();
    if (existing) {
      await db.patch(existing._id, { ...args, updatedAt: Date.now() });
    } else {
      await db.insert("restaurantStatus", {
        ...DEFAULT,
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});
