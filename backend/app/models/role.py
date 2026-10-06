from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    __table_args__ = (
        Index("ix_roles_name", "name", unique=True),
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

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="role",
        lazy="selectin",
    )