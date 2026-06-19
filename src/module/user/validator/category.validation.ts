import z from "zod";

export const categoryValidator = z.object({
    name: z.string(),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
})