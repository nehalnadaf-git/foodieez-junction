import { z } from "zod";

export const imageUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid image URL")
  .refine((value) => value.startsWith("https://"), {
    message: "Image URL must start with https://",
  });
