import z from "zod";

export const subCategoryValidation = z.object ({
    name: z.string(),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    categoryId: z.string()
})