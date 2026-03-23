import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const DEFAULTS = [
  { platform: "instagram", url: "https://www.instagram.com/foodieez_junction_01/?hl=en", active: true },
  { platform: "facebook", url: "https://facebook.com/foodieezjunction", active: true },
  { platform: "youtube", url: "", active: false },
  { platform: "whatsapp", url: "https://wa.me/919743862836", active: true },
];

export const getAll = query({
  args: {},
  handler: async ({ db }) => {
    const rows = await db.query("socialLinks").collect();
    if (rows.length === 0) {
      // Return defaults when table is empty (first run)
      return DEFAULTS;
    }
    return rows;
  },
});

export const upsert = mutation({
  args: { platform: v.string(), url: v.string(), active: v.boolean() },
  handler: async ({ db }, { platform, url, active }) => {
    const existing = await db
      .query("socialLinks")
      .withIndex("by_platform", (q) => q.eq("platform", platform))
      .first();
    if (existing) {
      await db.patch(existing._id, { url, active });
    } else {
      await db.insert("socialLinks", { platform, url, active });
    }
  },
});

export const saveAll = mutation({
  args: {
    links: v.array(
      v.object({ platform: v.string(), url: v.string(), active: v.boolean() })
    ),
  },
  handler: async ({ db }, { links }) => {
    for (const { platform, url, active } of links) {
      const existing = await db
        .query("socialLinks")
        .withIndex("by_platform", (q) => q.eq("platform", platform))
        .first();
      if (existing) {
        await db.patch(existing._id, { url, active });
      } else {
        await db.insert("socialLinks", { platform, url, active });
      }
    }
  },
});
