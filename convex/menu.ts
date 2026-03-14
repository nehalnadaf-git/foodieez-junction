import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCatalog = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const items = await ctx.db.query("menuItems").collect();
    
    return {
      categories: categories.map(c => ({
        id: c.categoryId,
        name: c.name,
        image: c.image || "",
        imageSource: c.imageSource,
      })),
      items: items.map(i => ({
        id: i.itemId,
        name: i.name,
        category: i.category,
        isVeg: i.isVeg,
        description: i.description,
        price: i.price,
        priceSmall: i.priceSmall,
        priceLarge: i.priceLarge,
        sizes: i.sizes,
        available: i.available,
        isSpecial: i.isSpecial,
        offer: i.offer,
        image: i.image,
        imageSource: i.imageSource,
        imageScale: i.imageScale,
      })),
    };
  },
});

export const saveCatalog = mutation({
  args: {
    categories: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        image: v.optional(v.string()),
        imageSource: v.optional(v.union(v.literal("upload"), v.literal("url"))),
      })
    ),
    items: v.array(
      v.object({
        id: v.string(),
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
        available: v.optional(v.boolean()),
        isSpecial: v.optional(v.boolean()),
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
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing entries
    const existingCategories = await ctx.db.query("categories").collect();
    for (const cat of existingCategories) {
      await ctx.db.delete(cat._id);
    }

    const existingItems = await ctx.db.query("menuItems").collect();
    for (const item of existingItems) {
      await ctx.db.delete(item._id);
    }

    // Insert new entries
    for (const cat of args.categories) {
      await ctx.db.insert("categories", {
        categoryId: cat.id,
        name: cat.name,
        image: cat.image,
        imageSource: cat.imageSource,
      });
    }

    for (const item of args.items) {
      await ctx.db.insert("menuItems", {
        itemId: item.id,
        name: item.name,
        category: item.category,
        isVeg: item.isVeg,
        description: item.description,
        price: item.price,
        priceSmall: item.priceSmall,
        priceLarge: item.priceLarge,
        sizes: item.sizes,
        available: item.available ?? true,
        isSpecial: item.isSpecial ?? false,
        offer: item.offer,
        image: item.image,
        imageSource: item.imageSource,
        imageScale: item.imageScale,
      });
    }
  },
});
