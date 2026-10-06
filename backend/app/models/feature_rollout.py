from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Index,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.feature_flag import FeatureFlag
    from app.models.user_assignment import UserAssignment


class FeatureRollout(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "feature_rollouts"

    __table_args__ = (
        Index(
            "uq_feature_rollouts_feature_environment",
            "feature_flag_id",
            "environment_id",
            unique=True,
        ),
        Index(
            "ix_feature_rollouts_feature_id",
            "feature_flag_id",
        ),
        Index(
            "ix_feature_rollouts_environment_id",
            "environment_id",
        ),
        Index(
            "ix_feature_rollouts_is_enabled",
            "is_enabled",
        ),
        CheckConstraint(
            "rollout_percentage >= 0 AND rollout_percentage <= 100",
            name="ck_feature_rollouts_percentage",
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

    is_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    rollout_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0.00",
    )

    targeting_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    version: Mapped[int] = mapped_column(
        nullable=False,
        default=1,
        server_default="1",
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        "FeatureFlag",
        back_populates="rollouts",
        lazy="joined",
    )

    environment: Mapped["Environment"] = relationship(
        "Environment",
        back_populates="feature_rollouts",
        lazy="joined",
    )

    user_assignments: Mapped[list["UserAssignment"]] = relationship(
        "UserAssignment",
        back_populates="feature_rollout",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )