import { z } from "zod";

export const createAttributeSchema = z.object({
    name: z.string().min(1, "Attribute name is required"),
    values: z.array(z.string().min(1)).optional(),
});

export const addAttributeValuesSchema = z.object({
    values: z.array(z.string().min(1)).min(1, "At least one value is required"),
});
