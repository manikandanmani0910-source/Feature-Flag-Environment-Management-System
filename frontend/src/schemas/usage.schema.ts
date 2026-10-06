import { z } from "zod";

export const usageFilterSchema =
  z.object({
    feature_flag_id: z
      .number()
      .int()
      .positive()
      .optional(),

    environment_id: z
      .number()
      .int()
      .positive()
      .optional(),

    start_date: z
      .string()
      .optional(),

    end_date: z
      .string()
      .optional(),
  });

export type UsageFilterData =
  z.infer<
    typeof usageFilterSchema
  >;