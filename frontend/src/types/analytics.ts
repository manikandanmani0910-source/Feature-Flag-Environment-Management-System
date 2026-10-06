export interface AnalyticsPeriod {
  start: string | null;
  end: string | null;
}

export interface FeatureStatistics {
  feature_flag_id: number;
  environment_id?: number | null;

  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;

  unique_users: number;
  adoption_rate: number;

  period: AnalyticsPeriod;
}

export interface EnvironmentStatistics {
  environment_id: number;

  total_evaluations: number;
  enabled_evaluations: number;
  disabled_evaluations: number;

  unique_users: number;

  period: AnalyticsPeriod;
}

export interface DailyUsagePoint {
  date: string;
  total: number;
  enabled: number;
  disabled: number;
}

export interface RolloutAnalytics {
  feature_flag_id: number;
  environment_id?: number | null;
  rollout_percentage: number;
  evaluations: number;
  enabled: number;
  disabled: number;
}