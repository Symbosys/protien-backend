import { z } from "zod";

export const createAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  locality: z.string().optional().nullable(),
  address: z.string().min(1, "Address details are required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  longitude: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits").optional(),
  pincode: z.string().min(6, "Pincode must be at least 6 digits").optional(),
  locality: z.string().optional().nullable(),
  address: z.string().min(1, "Address details are required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  longitude: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
  isDefault: z.boolean().optional(),
});
