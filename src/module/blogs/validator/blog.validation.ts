import { z } from "zod";

export const blogValidator = z.object({
  title: z.string().min(1, "Blog title is required").max(200, "Blog title is too long").trim(),
  slug: z.string().max(200, "Slug is too long").trim().optional(),
  content: z.string().min(1, "Blog content is required").trim(),
  excerpt: z.string().max(1000, "Excerpt is too long").trim().optional().nullable(),
  image: z.string().optional().nullable(),
  author: z.string().max(100, "Author name is too long").trim().optional(),
  tags: z.array(z.string()).optional().nullable(),
  isActive: z.union([z.boolean(), z.enum(["true", "false"])]).optional(),
  readTime: z.number().int().min(1, "Read time must be at least 1 minute").optional().nullable(),
});
