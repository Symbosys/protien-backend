import { z } from "zod";

export const variantSchema = z.object({
    sku: z.string().optional(),
    price: z.number().min(0, "Price must be non-negative"),
    discountPrice: z.number().min(0).optional(),
    quantity: z.number().int().min(0).default(0),
    image: z.string().url("Variant image must be a valid URL").optional().or(z.literal("")),
    attributeValues: z.array(z.string().uuid("Attribute Value ID must be a valid UUID")).min(1, "At least one attribute value is required for a variant"),
});

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    image: z.string().url("Main image must be a valid URL"),
    images: z.array(z.string().url()).optional(),
    brand: z.string().optional(),
    price: z.number().min(0, "Price must be non-negative"),
    discountPrice: z.number().min(0).optional(),
    quantity: z.number().int().min(0).default(0),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    categoryId: z.string().uuid("Category ID must be a valid UUID"),
    subCategoryId: z.string().uuid("SubCategory ID must be a valid UUID").optional(),
    variants: z.array(variantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();
