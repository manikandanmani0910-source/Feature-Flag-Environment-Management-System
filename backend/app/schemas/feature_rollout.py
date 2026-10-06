from datetime import datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class FeatureRolloutBase(BaseModel):
    feature_flag_id: int = Field(
        gt=0,
    )
    environment_id: int = Field(
        gt=0,
    )
    is_enabled: bool = False
    rollout_percentage: Decimal = Field(
        default=Decimal("0.00"),
        ge=Decimal("0.00"),
        le=Decimal("100.00"),
        decimal_places=2,
    )
    targeting_enabled: bool = False


class FeatureRolloutCreate(FeatureRolloutBase):
    pass


class FeatureRolloutUpdate(BaseModel):
    is_enabled: bool | None = None
    rollout_percentage: Decimal | None = Field(
        default=None,
        ge=Decimal("0.00"),
        le=Decimal("100.00"),
        decimal_places=2,
    )
    targeting_enabled: bool | None = None

    @model_validator(mode="after")
    def validate_rollout(self):
        if (
            self.rollout_percentage is not None
            and self.rollout_percentage > Decimal("0.00")
            and self.is_enabled is False
        ):
            raise ValueError(
                "rollout_percentage cannot be greater than 0 "
                "when the feature is explicitly disabled."
            )

        return self


class FeatureRolloutResponse(FeatureRolloutBase):
    id: int
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )