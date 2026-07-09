import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).min(1, "Invalid Product ID"),
  variantId: z.string().min(1, "Invalid Variant ID").optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional().default(1),
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});
