import type {
  FeatureRollout,
  FeatureRolloutCreateRequest,
  FeatureRolloutUpdateRequest,
} from "../../types/rollout";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import { normalizeList } from "../../utils/normalizeList";

export async function getRollouts(): Promise<
  FeatureRollout[]
> {
  const response =
    await apiClient.get(
      endpoints.rollouts.list,
    );

  return normalizeList<FeatureRollout>(
    response.data,
  );
}

export async function getRollout(
  id: number | string,
): Promise<FeatureRollout> {
  const response =
    await apiClient.get<FeatureRollout>(
      endpoints.rollouts.detail(id),
    );

  return response.data;
}

export async function createRollout(
  payload: FeatureRolloutCreateRequest,
): Promise<FeatureRollout> {
  const response =
    await apiClient.post<FeatureRollout>(
      endpoints.rollouts.create,
      payload,
    );

  return response.data;
}

export async function updateRollout(
  id: number | string,
  payload: FeatureRolloutUpdateRequest,
): Promise<FeatureRollout> {
  const response =
    await apiClient.put<FeatureRollout>(
      endpoints.rollouts.update(id),
      payload,
    );

  return response.data;
}

export async function deleteRollout(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.rollouts.delete(id),
  );
}