import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../services/dashboard/dashboardService";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 30000,
  });
}