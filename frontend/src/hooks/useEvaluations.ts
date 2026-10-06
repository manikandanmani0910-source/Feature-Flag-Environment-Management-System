import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  evaluateBatch,
  evaluateFeature,
  evaluateFeatureGet,
} from "../services/evaluations/evaluationService";

import type {
  EvaluationRequest,
} from "../types/evaluation";

export function useEvaluateFeature() {
  return useMutation({
    mutationFn: (
      payload: EvaluationRequest,
    ) => evaluateFeature(payload),
  });
}

export function useEvaluateBatch() {
  return useMutation({
    mutationFn: evaluateBatch,
  });
}

export interface EvaluationQueryParams {
  feature_key?: string;
  environment?: string;
  user_id?: number;
}

export function useEvaluationHistory(
  params?: EvaluationQueryParams,
) {
  const hasRequiredParams =
    Boolean(
      params?.feature_key &&
        params?.environment,
    );

  return useQuery({
    queryKey: [
      "evaluation",
      params,
    ],

    queryFn: async () => {
      if (
        !params?.feature_key ||
        !params?.environment
      ) {
        return [];
      }

      const result =
        await evaluateFeatureGet({
          feature_key:
            params.feature_key,

          environment:
            params.environment,

          ...(params.user_id !== undefined
            ? {
                user_id:
                  params.user_id,
              }
            : {}),
        });

      return [result];
    },

    enabled: hasRequiredParams,

    retry: false,
  });
}