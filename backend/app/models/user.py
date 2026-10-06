from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.role import Role


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    __table_args__ = (
        Index(
            "ix_users_email",
            "email",
            unique=True,
        ),
        Index(
            "ix_users_username",
            "username",
            unique=True,
        ),
        Index(
            "ix_users_role_id",
            "role_id",
        ),
        Index(
            "ix_users_is_active",
            "is_active",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="1",
    )

    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="0",
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey(
            "roles.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
        ),
        nullable=False,
    )

    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="users",
        lazy="joined",
    )