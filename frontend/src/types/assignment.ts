import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface UserAssignment {
  id: ID;
  user_id: number;
  feature_flag_id: number;
  environment_id?: number | null;

  is_enabled: boolean;

  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface AssignmentCreateRequest {
  user_id: number;
  feature_flag_id: number;
  environment_id?: number | null;
  is_enabled?: boolean;
}

export interface AssignmentUpdateRequest {
  is_enabled?: boolean;
}

export type AssignmentListResponse =
  PaginatedResponse<UserAssignment>;