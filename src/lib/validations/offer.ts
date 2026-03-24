import { z } from "zod";

export const offerTypes = ["none", "bogo", "percentage", "new_tag"] as const;

export const offerTypeSchema = z.enum(offerTypes);

export const offerEditorSchema = z
  .object({
    offerType: offerTypeSchema,
    offerPercentage: z.number().optional(),
  })
  .superRefine((offer, ctx) => {
    if (offer.offerType === "percentage") {
      if (typeof offer.offerPercentage !== "number" || Number.isNaN(offer.offerPercentage)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offerPercentage"],
          message: "Percentage value is required",
        });
      } else if (offer.offerPercentage < 1 || offer.offerPercentage > 99) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offerPercentage"],
          message: "Percentage must be between 1 and 99",
        });
      }
    }
  });

export type OfferEditorFormValues = z.infer<typeof offerEditorSchema>;
