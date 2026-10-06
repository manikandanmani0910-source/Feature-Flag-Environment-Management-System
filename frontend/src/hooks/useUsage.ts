import { useQuery } from "@tanstack/react-query";

import {
  getUsage,
  getUsageRecord,
  getUsageStatistics,
} from "../services/usage/usageService";

export function useUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: getUsage,
  });
}

export function useUsageRecord(
  id: number | string,
) {
  return useQuery({
    queryKey: ["usage", id],
    queryFn: () => getUsageRecord(id),
    enabled: Boolean(id),
  });
}

export function useUsageStatistics(
  featureFlagId?: number,
  environmentId?: number,
) {
  return useQuery({
    queryKey: [
      "usage-statistics",
      featureFlagId,
      environmentId,
    ],

    queryFn: () =>
      getUsageStatistics(
        featureFlagId,
        environmentId,
      ),
  });
}