import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const orderSettingsSchema = z.object({
  dineInWhatsappNumber: z.string().min(10, "Enter a valid number"),
  takeawayWhatsappNumber: z.string().min(10, "Enter a valid number"),
  openTimeIst: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  closeTimeIst: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  estimatedWaitTime: z.string().min(3, "Enter wait time"),
  orderIdPrefix: z.string().min(1, "Prefix is required").max(5, "Max 5 chars"),
  minimumOrderValue: z.number().min(0, "Cannot be negative"),
  maxQuantityPerItem: z.number().min(1, "Min 1").max(50, "Max 50"),
  dineInEnabled: z.boolean(),
});

export type OrderSettingsInput = z.infer<typeof orderSettingsSchema>;

export const tableSchema = z.object({
  name: z.string().min(1, "Table name is required").max(30, "Max 30 characters"),
  number: z
    .string()
    .regex(/^\d+$/, "Table number must be numeric")
    .min(1, "Table number is required"),
});

export type TableInput = z.infer<typeof tableSchema>;

export const reviewSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  rating: z.number().min(1, "Select a rating").max(5, "Max rating is 5"),
  reviewText: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(300, "Review must be at most 300 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
