import { z } from "zod";

export const toggleWishlistSchema = z.object({
  productId: z.string({ message: "Product ID is required" }).min(1, "Invalid Product ID"),
});
