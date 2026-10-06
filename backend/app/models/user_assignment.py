from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.feature_rollout import FeatureRollout
    from app.models.user import User


class UserAssignment(Base, TimestampMixin):
    __tablename__ = "user_assignments"

    __table_args__ = (
        UniqueConstraint(
            "feature_rollout_id",
            "user_id",
            name="uq_user_assignment_rollout_user",
        ),
        Index(
            "ix_user_assignments_user_id",
            "user_id",
        ),
        Index(
            "ix_user_assignments_rollout_id",
            "feature_rollout_id",
        ),
        Index(
            "ix_user_assignments_is_enabled",
            "is_enabled",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    feature_rollout_id: Mapped[int] = mapped_column(
        ForeignKey(
            "feature_rollouts.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        nullable=False,
    )

    is_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    feature_rollout: Mapped["FeatureRollout"] = relationship(
        "FeatureRollout",
        back_populates="user_assignments",
        lazy="joined",
    )

    user: Mapped["User"] = relationship(
        "User",
        lazy="joined",
    )