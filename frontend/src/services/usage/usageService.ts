import type {
  FeatureUsage,
  UsageStatistics,
} from "../../types/usage";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getUsage(): Promise<
  FeatureUsage[]
> {
  const response =
    await apiClient.get<FeatureUsage[]>(
      endpoints.usage.list,
    );

  return response.data;
}

export async function getUsageRecord(
  id: number | string,
): Promise<FeatureUsage> {
  const response =
    await apiClient.get<FeatureUsage>(
      endpoints.usage.detail(id),
    );

  return response.data;
}

export async function getUsageStatistics(
  featureFlagId?: number,
  environmentId?: number,
): Promise<UsageStatistics> {
  const params: Record<string, number> = {};

  if (featureFlagId !== undefined) {
    params.feature_flag_id =
      featureFlagId;
  }

  if (environmentId !== undefined) {
    params.environment_id =
      environmentId;
  }

  const response =
    await apiClient.get<UsageStatistics>(
      endpoints.analytics.dailyUsage,
      { params },
    );

  return response.data;
}