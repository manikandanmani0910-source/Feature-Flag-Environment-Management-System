import type {
  FeatureSchedule,
  FeatureScheduleCreateRequest,
  FeatureScheduleUpdateRequest,
} from "../../types/schedule";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getSchedules(): Promise<
  FeatureSchedule[]
> {
  const response =
    await apiClient.get<FeatureSchedule[]>(
      endpoints.schedules.list,
    );

  return response.data;
}

export async function getSchedule(
  id: number | string,
): Promise<FeatureSchedule> {
  const response =
    await apiClient.get<FeatureSchedule>(
      endpoints.schedules.detail(id),
    );

  return response.data;
}

export async function createSchedule(
  payload: FeatureScheduleCreateRequest,
): Promise<FeatureSchedule> {
  const response =
    await apiClient.post<FeatureSchedule>(
      endpoints.schedules.create,
      payload,
    );

  return response.data;
}

export async function updateSchedule(
  id: number | string,
  payload: FeatureScheduleUpdateRequest,
): Promise<FeatureSchedule> {
  const response =
    await apiClient.put<FeatureSchedule>(
      endpoints.schedules.update(id),
      payload,
    );

  return response.data;
}

export async function deleteSchedule(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.schedules.delete(id),
  );
}