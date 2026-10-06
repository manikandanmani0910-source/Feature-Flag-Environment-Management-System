import { z } from "zod";

export const rolloutSchema =
  z.object({
    feature_flag_id: z
      .number()
      .int()
      .positive(
        "Feature flag is required",
      ),

    environment_id: z
      .number()
      .int()
      .positive(
        "Environment is required",
      ),

    is_enabled: z
      .boolean()
      .default(true),

    rollout_percentage: z
      .number()
      .min(0)
      .max(100),

    targeting_enabled: z
      .boolean()
      .default(false),
  });

export type RolloutFormData =
  z.infer<typeof rolloutSchema>;