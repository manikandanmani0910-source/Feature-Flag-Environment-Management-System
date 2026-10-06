import { z } from "zod";

export const environmentSchema =
  z.object({
    name: z
      .string()
      .min(1, "Environment name is required")
      .max(100),

    description: z
      .string()
      .max(500)
      .optional()
      .or(z.literal("")),

    is_active: z
      .boolean()
      .default(true),
  });

export type EnvironmentFormData =
  z.infer<typeof environmentSchema>;