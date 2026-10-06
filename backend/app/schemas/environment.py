from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EnvironmentBase(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
    )
    is_active: bool = True


class EnvironmentCreate(EnvironmentBase):
    pass


class EnvironmentUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
    )
    is_active: bool | None = None


class EnvironmentResponse(EnvironmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )