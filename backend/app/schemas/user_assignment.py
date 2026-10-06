from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserAssignmentCreate(BaseModel):
    feature_rollout_id: int = Field(gt=0)
    user_id: int = Field(gt=0)
    is_enabled: bool = True


class UserAssignmentUpdate(BaseModel):
    is_enabled: bool


class UserAssignmentResponse(BaseModel):
    id: int
    feature_rollout_id: int
    user_id: int
    is_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserAssignmentSummary(BaseModel):
    total_assignments: int
    enabled_assignments: int
    disabled_assignments: int