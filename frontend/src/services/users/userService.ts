import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from "../../types/user";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getUsers(): Promise<User[]> {
  const response =
    await apiClient.get<User[]>(
      endpoints.users.list,
    );

  return response.data;
}

export async function getUser(
  id: number | string,
): Promise<User> {
  const response =
    await apiClient.get<User>(
      endpoints.users.detail(id),
    );

  return response.data;
}

export async function createUser(
  payload: UserCreateRequest,
): Promise<User> {
  const response =
    await apiClient.post<User>(
      endpoints.users.create,
      payload,
    );

  return response.data;
}

export async function updateUser(
  id: number | string,
  payload: UserUpdateRequest,
): Promise<User> {
  const response =
    await apiClient.put<User>(
      endpoints.users.update(id),
      payload,
    );

  return response.data;
}

export async function deleteUser(
  id: number | string,
): Promise<void> {
  await apiClient.delete(
    endpoints.users.delete(id),
  );
}