import { z } from "zod";

export const offerTypes = [
  "percentage_off",
  "buy_one_get_one",
  "flat_discount",
  "limited_time",
  "new_item",
  "best_seller",
  "today_only",
  "custom",
] as const;

export const offerTypeSchema = z.enum(offerTypes);

export const itemOfferSchema = z
  .object({
    type: offerTypeSchema,
    value: z.number().optional(),
    customText: z.string().trim().max(20).optional(),
    active: z.boolean(),
    expiresAt: z.string().optional(),
  })
  .superRefine((offer, ctx) => {
    if (offer.type === "percentage_off") {
      if (typeof offer.value !== "number" || Number.isNaN(offer.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Percentage value is required",
        });
      } else if (offer.value < 1 || offer.value > 99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Percentage must be between 1 and 99",
        });
      }
    }

    if (offer.type === "flat_discount") {
      if (typeof offer.value !== "number" || Number.isNaN(offer.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Discount value is required",
        });
      } else if (offer.value < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Discount value must be at least 1",
        });
      }
    }

    if (offer.type === "custom") {
      if (!offer.customText || offer.customText.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customText"],
          message: "Custom text is required",
        });
      }
    }

    if (offer.expiresAt && offer.expiresAt.trim().length > 0) {
      const parsed = new Date(offer.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiresAt"],
          message: "Invalid expiry date/time",
        });
      }
    }
  });

export const offerEditorSchema = z
  .object({
    type: z.enum(["none", ...offerTypes]),
    value: z.number().optional(),
    customText: z.string().trim().max(20).optional(),
    active: z.boolean(),
    expiresAt: z.string().optional(),
  })
  .superRefine((offer, ctx) => {
    if (offer.type === "none") {
      return;
    }

    if (offer.type === "percentage_off") {
      if (typeof offer.value !== "number" || Number.isNaN(offer.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Percentage value is required",
        });
      } else if (offer.value < 1 || offer.value > 99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Percentage must be between 1 and 99",
        });
      }
    }

    if (offer.type === "flat_discount") {
      if (typeof offer.value !== "number" || Number.isNaN(offer.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Discount value is required",
        });
      } else if (offer.value < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Discount value must be at least 1",
        });
      }
    }

    if (offer.type === "custom") {
      if (!offer.customText || offer.customText.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customText"],
          message: "Custom text is required",
        });
      }
    }

    if (offer.expiresAt && offer.expiresAt.trim().length > 0) {
      const parsedDate = new Date(offer.expiresAt);
      if (Number.isNaN(parsedDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiresAt"],
          message: "Invalid expiry date/time",
        });
      }
    }
  });

export type OfferEditorFormValues = z.infer<typeof offerEditorSchema>;
