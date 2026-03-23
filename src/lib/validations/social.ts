import { z } from "zod";

/**
 * Validates a single social media platform URL.
 * The URL must be a valid HTTPS URL.
 * Empty strings are allowed (they indicate an unset URL).
 */
export const socialUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (value.trim().length === 0) return true;
      try {
        const parsed = new URL(value.trim());
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL starting with https://" }
  );

/**
 * Schema for a single social link entry.
 */
export const socialLinkSchema = z.object({
  platform: z.enum(["instagram", "facebook", "youtube", "whatsapp"]),
  url: socialUrlSchema,
  active: z.boolean(),
});

/**
 * Schema for the full social links configuration object.
 */
export const socialLinksConfigSchema = z.object({
  links: z.array(socialLinkSchema),
});

export type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;
export type SocialLinksFormValues = z.infer<typeof socialLinksConfigSchema>;
