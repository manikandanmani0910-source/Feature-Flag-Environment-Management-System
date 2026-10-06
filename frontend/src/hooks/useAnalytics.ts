import { useQuery } from "@tanstack/react-query";

import {
  getAnalyticsSummary,
  getDailyUsage,
  getTopFeatures,
} from "../services/analytics/analyticsService";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],

    queryFn: async () => {
      const [
        summary,
        dailyUsage,
        topFeatures,
      ] = await Promise.all([
        getAnalyticsSummary(),
        getDailyUsage({
          days: 30,
        }),
        getTopFeatures({
          limit: 10,
        }),
      ]);

      return {
        summary,
        dailyUsage,
        topFeatures,
      };
    },
  });
}