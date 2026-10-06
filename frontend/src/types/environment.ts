import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface Environment {
  id: ID;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface EnvironmentCreateRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface EnvironmentUpdateRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export type EnvironmentListResponse =
  PaginatedResponse<Environment>;