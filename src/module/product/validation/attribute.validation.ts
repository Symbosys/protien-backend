import { z } from "zod";

export const valueSchema = z.union([
    z.string().min(1),
    z.object({
        value: z.string().min(1),
        image: z.string().optional().or(z.literal("")),
    })
]);

export const createAttributeSchema = z.object({
    name: z.string().min(1, "Attribute name is required"),
    values: z.array(valueSchema).optional(),
});

export const addAttributeValuesSchema = z.object({
    values: z.array(valueSchema).min(1, "At least one value is required"),
});
