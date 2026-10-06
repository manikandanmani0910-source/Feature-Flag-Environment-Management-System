from typing import TYPE_CHECKING, Any

from sqlalchemy import (
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.environment import Environment
    from app.models.user import User


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    __table_args__ = (
        Index(
            "ix_audit_logs_actor_id",
            "actor_id",
        ),
        Index(
            "ix_audit_logs_action",
            "action",
        ),
        Index(
            "ix_audit_logs_entity",
            "entity_type",
            "entity_id",
        ),
        Index(
            "ix_audit_logs_created_at",
            "created_at",
        ),
        Index(
            "ix_audit_logs_environment_id",
            "environment_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
        ),
        nullable=True,
    )

    environment_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "environments.id",
            ondelete="SET NULL",
            onupdate="CASCADE",
        ),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    entity_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    entity_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    old_values: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    new_values: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )

    user_agent: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    actor: Mapped["User | None"] = relationship(
        "User",
        lazy="joined",
    )

    environment: Mapped["Environment | None"] = relationship(
        "Environment",
        back_populates="audit_logs",
        lazy="joined",
    )