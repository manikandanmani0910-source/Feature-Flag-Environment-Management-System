import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface FeatureFlag {
  id: ID;
  key: string;
  name: string;
  description?: string | null;

  enabled?: boolean;
  is_enabled?: boolean;
  is_active?: boolean;

  created_at?: ISODateString | null;
  updated_at?: ISODateString | null;
}

export interface FeatureFlagCreateRequest {
  key: string;
  name: string;
  description?: string;
  is_active?: boolean;
  enabled?: boolean;
}

export interface FeatureFlagUpdateRequest {
  key?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
  enabled?: boolean;
}

export type FeatureFlagListResponse =
  PaginatedResponse<FeatureFlag>;