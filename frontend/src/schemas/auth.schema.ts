import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(
      8,
      "Password must contain at least 8 characters",
    ),

  full_name: z
    .string()
    .min(2, "Full name is required"),

  role_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .optional(),
});

export type LoginFormData =
  z.infer<typeof loginSchema>;

export type RegisterFormData =
  z.infer<typeof registerSchema>;