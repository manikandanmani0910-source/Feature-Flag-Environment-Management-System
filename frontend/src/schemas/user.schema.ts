import { z } from "zod";

export const userSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),

  full_name: z
    .string()
    .min(2, "Full name is required")
    .max(150),

  password: z
    .string()
    .min(
      8,
      "Password must contain at least 8 characters",
    )
    .optional()
    .or(z.literal("")),

  role_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .default(true),
});

export type UserFormData =
  z.infer<typeof userSchema>;