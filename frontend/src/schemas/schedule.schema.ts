import { z } from "zod";

export const scheduleSchema =
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

    start_time: z
      .string()
      .min(
        1,
        "Start time is required",
      ),

    end_time: z
      .string()
      .optional()
      .or(z.literal("")),

    status: z
      .string()
      .default("SCHEDULED"),
  });

export type ScheduleFormData =
  z.infer<
    typeof scheduleSchema
  >;