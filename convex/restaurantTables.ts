import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query("restaurantTables")
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    tableId: v.string(),
    name: v.string(),
    number: v.string(),
    isActive: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async ({ db }, args) => {
    // Prevent duplicate table numbers
    const duplicate = await db
      .query("restaurantTables")
      .withIndex("by_number", (q) => q.eq("number", args.number))
      .first();
    if (!duplicate) {
      await db.insert("restaurantTables", args);
    }
  },
});

export const toggleActive = mutation({
  args: { tableId: v.string(), isActive: v.boolean() },
  handler: async ({ db }, { tableId, isActive }) => {
    const row = await db
      .query("restaurantTables")
      .withIndex("by_tableId", (q) => q.eq("tableId", tableId))
      .first();
    if (row) {
      await db.patch(row._id, { isActive });
    }
  },
});

export const remove = mutation({
  args: { tableId: v.string() },
  handler: async ({ db }, { tableId }) => {
    const row = await db
      .query("restaurantTables")
      .withIndex("by_tableId", (q) => q.eq("tableId", tableId))
      .first();
    if (row) {
      await db.delete(row._id);
    }
  },
});

export const reorder = mutation({
  args: {
    tables: v.array(
      v.object({
        tableId: v.string(),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async ({ db }, { tables }) => {
    for (const { tableId, sortOrder } of tables) {
      const row = await db
        .query("restaurantTables")
        .withIndex("by_tableId", (q) => q.eq("tableId", tableId))
        .first();
      if (row) {
        await db.patch(row._id, { sortOrder });
      }
    }
  },
});
