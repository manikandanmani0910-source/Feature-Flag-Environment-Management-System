import type { ISODateString } from "./common";

export interface EvaluationRequest {
  feature_key: string;
  environment: string;
  user_id?: number | null;
}

export interface EvaluationResult {
  enabled: boolean;
  feature_key: string;
  environment: string;
  user_id?: number | null;

  reason: string;
  source: string;

  rollout_percentage?: number | null;

  evaluated_at?: ISODateString | null;

  cached: boolean;
}