import type {
  ID,
  PaginatedResponse,
} from "./common";

export interface FeatureRollout {
  id: ID;
  feature_flag_id: number;
  environment_id: number;

  is_enabled: boolean;
  rollout_percentage: number;
  targeting_enabled: boolean;

  version: number;
}

export interface FeatureRolloutCreateRequest {
  feature_flag_id: number;
  environment_id: number;
  is_enabled?: boolean;
  rollout_percentage?: number;
  targeting_enabled?: boolean;
}

export interface FeatureRolloutUpdateRequest {
  is_enabled?: boolean;
  rollout_percentage?: number;
  targeting_enabled?: boolean;
}

export type FeatureRolloutListResponse =
  PaginatedResponse<FeatureRollout>;