import type {
  EvaluationRequest,
  EvaluationResult,
} from "../../types/evaluation";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

/* ========================================================= */
/* POST - SINGLE FEATURE EVALUATION */
/* POST /api/v1/evaluations/evaluate */
/* ========================================================= */

export async function evaluateFeature(
  payload: EvaluationRequest,
): Promise<EvaluationResult> {
  const response =
    await apiClient.post<EvaluationResult>(
      endpoints.evaluations.evaluate,
      payload,
    );

  return response.data;
}

/* ========================================================= */
/* GET - SINGLE FEATURE EVALUATION */
/* GET /api/v1/evaluations/evaluate */
/* ========================================================= */

export interface EvaluationQueryParams {
  feature_key: string;
  environment: string;
  user_id?: number;
}

export async function evaluateFeatureGet(
  params: EvaluationQueryParams,
): Promise<EvaluationResult> {
  const response =
    await apiClient.get<EvaluationResult>(
      endpoints.evaluations.evaluateGet,
      {
        params,
      },
    );

  return response.data;
}

/* ========================================================= */
/* POST - BATCH EVALUATION */
/* POST /api/v1/evaluations/evaluate-many */
/* ========================================================= */

export interface BatchEvaluationRequest {
  feature_key: string;
  environment: string;
  user_ids?: number[];
}

export interface BatchEvaluationResult {
  results: EvaluationResult[];
}

export async function evaluateBatch(
  payload: BatchEvaluationRequest,
): Promise<BatchEvaluationResult> {
  const response =
    await apiClient.post<BatchEvaluationResult>(
      endpoints.evaluations.batch,
      payload,
    );

  return response.data;
}

/* ========================================================= */
/* POST - INVALIDATE CACHE */
/* POST /api/v1/evaluations/invalidate */
/* ========================================================= */

export async function invalidateEvaluationCache(): Promise<void> {
  await apiClient.post(
    endpoints.evaluations.invalidate,
  );
}