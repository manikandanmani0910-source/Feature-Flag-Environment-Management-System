import type {
  DashboardResponse,
} from "../../types/dashboard";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getDashboard(): Promise<
  DashboardResponse
> {
  const response =
    await apiClient.get<DashboardResponse>(
      endpoints.dashboard.dashboard,
    );

  return response.data;
}