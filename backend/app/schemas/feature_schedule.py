from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class FeatureScheduleBase(BaseModel):
    feature_flag_id: int = Field(
        gt=0,
    )
    environment_id: int = Field(
        gt=0,
    )
    start_time: datetime
    end_time: datetime | None = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time is not None and self.end_time <= self.start_time:
            raise ValueError(
                "end_time must be later than start_time."
            )

        return self


class FeatureScheduleCreate(FeatureScheduleBase):
    pass


class FeatureScheduleUpdate(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if (
            self.start_time is not None
            and self.end_time is not None
            and self.end_time <= self.start_time
        ):
            raise ValueError(
                "end_time must be later than start_time."
            )

        return self


class FeatureScheduleResponse(FeatureScheduleBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )