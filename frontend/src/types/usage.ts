import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface FeatureUsage {
  id: ID;

  feature_flag_id: number;
  environment_id?: number | null;
  user_id?: number | null;

  enabled?: boolean;
  is_enabled?: boolean;

  evaluated_at?: ISODateString | null;
  created_at?: ISODateString | null;
}

export interface UsageStatistics {
  feature_flag_id?: number;
  environment_id?: number | null;

  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;
  unique_users: number;
  adoption_rate: number;

  period: {
    start: ISODateString | null;
    end: ISODateString | null;
  };
}

export type UsageListResponse =
  PaginatedResponse<FeatureUsage>;