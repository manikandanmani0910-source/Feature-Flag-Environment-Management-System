import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface Role {
  id: number;
  name: string;
  description?: string | null;
}

export interface User {
  id: ID;
  email: string;

  full_name?: string | null;

  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;

  role_id?: number | null;

  role?: Role | null;

  is_active: boolean;
  is_superuser?: boolean;

  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  full_name: string;
  role_id?: number | null;
  is_active?: boolean;
}

export interface UserUpdateRequest {
  email?: string;
  password?: string;
  full_name?: string;
  role_id?: number | null;
  is_active?: boolean;
}

export type UserListResponse =
  PaginatedResponse<User>;