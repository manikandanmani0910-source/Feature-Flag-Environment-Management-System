import { z } from "zod";

export const assignmentSchema =
  z.object({
    user_id: z
      .number()
      .int()
      .positive("User is required"),

    feature_flag_id: z
      .number()
      .int()
      .positive(
        "Feature flag is required",
      ),

    environment_id: z
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),

    is_enabled: z
      .boolean()
      .default(true),
  });

export type AssignmentFormData =
  z.infer<
    typeof assignmentSchema
  >;