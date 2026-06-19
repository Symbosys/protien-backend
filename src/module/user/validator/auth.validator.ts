import z from "zod";

export const OtpValidator = z.object({
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number format"),
});

export const LoginValidator = z.object({
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/, "Invalid mobile number format"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});