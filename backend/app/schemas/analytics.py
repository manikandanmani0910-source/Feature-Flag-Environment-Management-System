from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class FeatureUsageResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    usage_date: date
    evaluation_count: int
    enabled_count: int
    disabled_count: int
    unique_user_count: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class FeatureAnalyticsSummary(BaseModel):
    feature_flag_id: int
    environment_id: int
    total_evaluations: int
    total_enabled: int
    total_disabled: int
    unique_users: int
    enable_rate: float


class RolloutStatistics(BaseModel):
    feature_flag_id: int
    environment_id: int
    is_enabled: bool
    rollout_percentage: float
    assigned_users: int
    enabled_users: int
    version: int


class EnvironmentSummary(BaseModel):
    environment_id: int
    environment_name: str
    total_features: int
    active_features: int
    disabled_features: int
    average_rollout_percentage: float


class DashboardSummary(BaseModel):
    total_features: int
    active_features: int
    disabled_features: int
    total_environments: int
    active_environments: int
    total_rollouts: int
    average_rollout_percentage: float