import type { ID } from "./common";

export interface AuthUser {
  id: ID;

  email: string;

  full_name?: string | null;

  role_id?: number | null;

  is_active: boolean;

  is_superuser?: boolean;

  role?: {
    id: number;
    name: string;
  } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user?: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role_id?: number | null;
  is_active?: boolean;
}