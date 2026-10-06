from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.audit_log import AuditLog
    from app.models.feature_rollout import FeatureRollout


class Environment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "environments"

    __table_args__ = (
        Index(
            "uq_environments_name",
            "name",
            unique=True,
        ),
        Index(
            "ix_environments_is_active",
            "is_active",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(50),
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

    feature_rollouts: Mapped[list["FeatureRollout"]] = relationship(
        "FeatureRollout",
        back_populates="environment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog",
        back_populates="environment",
        passive_deletes=True,
    )