import type {
  Environment,
  EnvironmentCreateRequest,
  EnvironmentUpdateRequest,
} from "../../types/environment";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getEnvironments(): Promise<
  Environment[]
> {
  const response =
    await apiClient.get<Environment[]>(
      endpoints.environments.list,
    );

  return response.data;
}

export async function getEnvironment(
  id: number | string,
): Promise<Environment> {
  const response =
    await apiClient.get<Environment>(
      endpoints.environments.detail(id),
    );

  return response.data;
}

export async function createEnvironment(
  payload: EnvironmentCreateRequest,
): Promise<Environment> {
  const response =
    await apiClient.post<Environment>(
      endpoints.environments.create,
      payload,
    );

  return response.data;
}

export async function updateEnvironment(
  id: number | string,
  payload: EnvironmentUpdateRequest,
): Promise<Environment> {
  const response =
    await apiClient.put<Environment>(
      endpoints.environments.update(id),
      payload,
    );

  return response.data;
}

export async function deleteEnvironment(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.environments.delete(id),
  );
}