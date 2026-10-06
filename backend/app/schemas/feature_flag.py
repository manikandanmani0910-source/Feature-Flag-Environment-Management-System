from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FeatureFlagBase(BaseModel):
    key: str = Field(
        min_length=2,
        max_length=150,
        pattern=r"^[a-zA-Z][a-zA-Z0-9_.-]*$",
    )
    name: str = Field(
        min_length=2,
        max_length=150,
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
    )


class FeatureFlagCreate(FeatureFlagBase):
    is_active: bool = True


class FeatureFlagUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    description: str | None = Field(
        default=None,
        max_length=2000,
    )
    is_active: bool | None = None


class FeatureFlagResponse(FeatureFlagBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class FeatureFlagSummary(BaseModel):
    id: int
    key: str
    name: str
    is_active: bool
    environment_count: int = 0
    enabled_environment_count: int = 0

    model_config = ConfigDict(
        from_attributes=True,
    )