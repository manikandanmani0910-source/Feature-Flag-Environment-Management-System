import type {
  FeatureFlag,
  FeatureFlagCreateRequest,
  FeatureFlagUpdateRequest,
} from "../../types/featureFlag";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getFeatureFlags(): Promise<
  FeatureFlag[]
> {
  const response =
    await apiClient.get<FeatureFlag[]>(
      endpoints.featureFlags.list,
    );

  return response.data;
}

export async function getFeatureFlag(
  id: number | string,
): Promise<FeatureFlag> {
  const response =
    await apiClient.get<FeatureFlag>(
      endpoints.featureFlags.detail(id),
    );

  return response.data;
}

export async function createFeatureFlag(
  payload: FeatureFlagCreateRequest,
): Promise<FeatureFlag> {
  const response =
    await apiClient.post<FeatureFlag>(
      endpoints.featureFlags.create,
      payload,
    );

  return response.data;
}

export async function updateFeatureFlag(
  id: number | string,
  payload: FeatureFlagUpdateRequest,
): Promise<FeatureFlag> {
  const response =
    await apiClient.put<FeatureFlag>(
      endpoints.featureFlags.update(id),
      payload,
    );

  return response.data;
}

export async function deleteFeatureFlag(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.featureFlags.delete(id),
  );
}

export async function activateFeatureFlag(
  id: number | string,
): Promise<FeatureFlag> {
  const response =
    await apiClient.post<FeatureFlag>(
      endpoints.featureFlags.activate(id),
    );

  return response.data;
}

export async function deactivateFeatureFlag(
  id: number | string,
): Promise<FeatureFlag> {
  const response =
    await apiClient.post<FeatureFlag>(
      endpoints.featureFlags.deactivate(id),
    );

  return response.data;
}