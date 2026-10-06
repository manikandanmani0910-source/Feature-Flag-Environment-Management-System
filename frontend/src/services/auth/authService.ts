import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../../types/auth";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await apiClient.post<LoginResponse>(
      endpoints.auth.login,
      payload,
    );

  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(
    endpoints.auth.logout,
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response =
    await apiClient.get<AuthUser>(
      endpoints.auth.me,
    );

  return response.data;
}