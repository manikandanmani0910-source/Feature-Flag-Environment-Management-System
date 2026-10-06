import { z } from "zod";

export const featureFlagSchema =
  z.object({
    key: z
      .string()
      .min(1, "Feature key is required")
      .max(150)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Use only letters, numbers, dots, hyphens and underscores",
      ),

    name: z
      .string()
      .min(1, "Feature name is required")
      .max(150),

    description: z
      .string()
      .max(1000)
      .optional()
      .or(z.literal("")),

    enabled: z
      .boolean()
      .default(false),

    is_active: z
      .boolean()
      .default(true),
  });

export type FeatureFlagFormData =
  z.infer<
    typeof featureFlagSchema
  >;