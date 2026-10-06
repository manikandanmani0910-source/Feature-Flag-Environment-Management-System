from pydantic import BaseModel


class DashboardFeatureSummary(BaseModel):
    total: int
    active: int
    disabled: int


class DashboardEnvironmentSummary(BaseModel):
    total: int
    active: int
    inactive: int


class DashboardRolloutSummary(BaseModel):
    total: int
    enabled: int
    disabled: int
    average_percentage: float


class DashboardSummary(BaseModel):
    features: DashboardFeatureSummary
    environments: DashboardEnvironmentSummary
    rollouts: DashboardRolloutSummary
    total_users: int
    total_assignments: int
    total_audit_logs: int