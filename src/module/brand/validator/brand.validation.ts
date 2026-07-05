import { z } from "zod";

export const brandValidator = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Brand name is too long").trim(),
  slug: z.string().max(100, "Slug is too long").trim().optional(),
  description: z.string().max(1000, "Description is too long").trim().optional(),
  logo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")).nullable(),
  isActive: z.union([z.boolean(), z.enum(["true", "false"])]).optional(),
});
