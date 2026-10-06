from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import ScheduleStatus
from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.feature_flag import FeatureFlag


class FeatureSchedule(Base, TimestampMixin):
    __tablename__ = "feature_schedules"

    __table_args__ = (
        Index(
            "ix_feature_schedules_feature_id",
            "feature_flag_id",
        ),
        Index(
            "ix_feature_schedules_environment_id",
            "environment_id",
        ),
        Index(
            "ix_feature_schedules_start_time",
            "start_time",
        ),
        Index(
            "ix_feature_schedules_status",
            "status",
        ),
        CheckConstraint(
            "end_time IS NULL OR end_time > start_time",
            name="ck_feature_schedules_time_range",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    feature_flag_id: Mapped[int] = mapped_column(
        ForeignKey(
            "feature_flags.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        nullable=False,
    )

    environment_id: Mapped[int] = mapped_column(
        ForeignKey(
            "environments.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
        ),
        nullable=False,
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ScheduleStatus.SCHEDULED.value,
        server_default=ScheduleStatus.SCHEDULED.value,
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        "FeatureFlag",
        back_populates="schedules",
        lazy="joined",
    )

    environment: Mapped["Environment"] = relationship(
        "Environment",
        lazy="joined",
    )