from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.feature_rollout import FeatureRollout
    from app.models.feature_schedule import FeatureSchedule
    from app.models.feature_usage import FeatureUsage


class FeatureFlag(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "feature_flags"

    __table_args__ = (
        Index(
            "uq_feature_flags_key",
            "key",
            unique=True,
        ),
        Index(
            "ix_feature_flags_is_active",
            "is_active",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    key: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    rollouts: Mapped[list["FeatureRollout"]] = relationship(
        "FeatureRollout",
        back_populates="feature_flag",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    schedules: Mapped[list["FeatureSchedule"]] = relationship(
        "FeatureSchedule",
        back_populates="feature_flag",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    usage_records: Mapped[list["FeatureUsage"]] = relationship(
        "FeatureUsage",
        back_populates="feature_flag",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )