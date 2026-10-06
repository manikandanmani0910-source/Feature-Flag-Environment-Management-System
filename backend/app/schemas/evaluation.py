from typing import Any

from pydantic import BaseModel, Field


class FeatureEvaluationRequest(BaseModel):
    feature_key: str = Field(
        min_length=2,
        max_length=150,
    )
    environment: str = Field(
        min_length=2,
        max_length=50,
    )
    user_id: int | None = Field(
        default=None,
        gt=0,
    )
    user_identifier: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    attributes: dict[str, Any] = Field(
        default_factory=dict,
    )


class FeatureEvaluationResponse(BaseModel):
    feature_key: str
    environment: str
    enabled: bool
    reason: str
    rollout_percentage: float
    evaluated_for_user: bool
    assignment_id: int | None = None
    rollout_version: int | None = None