import { z } from "zod";

export const toggleWishlistSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).uuid("Invalid Product ID"),
});
