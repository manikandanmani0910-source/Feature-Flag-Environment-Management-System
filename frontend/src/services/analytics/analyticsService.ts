import type {
  FeatureStatistics,
  DailyUsagePoint,
  RolloutAnalytics,
} from "../../types/analytics";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

/* ========================================================= */
/* ANALYTICS SUMMARY */
/* GET /api/v1/analytics/summary */
/* ========================================================= */

export interface AnalyticsSummary {
  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;
  unique_users: number;
  active_features: number;
  active_environments: number;
  adoption_rate: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response =
    await apiClient.get<AnalyticsSummary>(
      endpoints.analytics.summary,
    );

  return response.data;
}

/* ========================================================= */
/* DAILY USAGE */
/* GET /api/v1/analytics/daily-usage */
/* ========================================================= */

export interface DailyUsageParams {
  feature_flag_id?: number;
  environment_id?: number;
  days?: number;
}

export async function getDailyUsage(
  params?: DailyUsageParams,
): Promise<DailyUsagePoint[]> {
  const response =
    await apiClient.get<DailyUsagePoint[]>(
      endpoints.analytics.dailyUsage,
      {
        params,
      },
    );

  return Array.isArray(response.data)
    ? response.data
    : [];
}

/* ========================================================= */
/* TOP FEATURES */
/* GET /api/v1/analytics/top-features */
/* ========================================================= */

export interface TopFeatureAnalytics {
  feature_flag_id: number;
  key: string;
  name: string;
  evaluation_count: number;
  enabled_count: number;
  disabled_count: number;
  unique_users: number;
}

export interface TopFeatureParams {
  environment_id?: number;
  limit?: number;
}

export async function getTopFeatures(
  params?: TopFeatureParams,
): Promise<TopFeatureAnalytics[]> {
  const response =
    await apiClient.get<TopFeatureAnalytics[]>(
      endpoints.analytics.topFeatures,
      {
        params,
      },
    );

  return Array.isArray(response.data)
    ? response.data
    : [];
}

/* ========================================================= */
/* FEATURE ANALYTICS */
/* GET /api/v1/analytics/features/{feature_flag_id} */
/* ========================================================= */

export async function getFeatureAnalytics(
  featureFlagId: number,
  environmentId?: number,
): Promise<FeatureStatistics> {
  const response =
    await apiClient.get<FeatureStatistics>(
      endpoints.analytics.feature(
        featureFlagId,
      ),
      {
        params:
          environmentId !== undefined
            ? {
                environment_id:
                  environmentId,
              }
            : undefined,
      },
    );

  return response.data;
}

/* ========================================================= */
/* ENVIRONMENT ANALYTICS */
/* GET /api/v1/analytics/environments/{environment_id} */
/* ========================================================= */

export async function getEnvironmentAnalytics(
  environmentId: number,
): Promise<FeatureStatistics> {
  const response =
    await apiClient.get<FeatureStatistics>(
      endpoints.analytics.environment(
        environmentId,
      ),
    );

  return response.data;
}

/* ========================================================= */
/* ROLLOUT ANALYTICS */
/* GET /api/v1/analytics/rollouts/{feature_flag_id} */
/* ========================================================= */

export async function getRolloutAnalytics(
  featureFlagId: number,
): Promise<RolloutAnalytics[]> {
  const response =
    await apiClient.get<RolloutAnalytics[]>(
      endpoints.analytics.rollout(
        featureFlagId,
      ),
    );

  return Array.isArray(response.data)
    ? response.data
    : [];
}