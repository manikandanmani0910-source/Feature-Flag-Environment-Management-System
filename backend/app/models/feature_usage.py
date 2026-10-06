from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import (
    BigInteger,
    ForeignKey,
    Index,
    Integer,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.feature_flag import FeatureFlag


class FeatureUsage(Base, TimestampMixin):
    __tablename__ = "feature_usage"

    __table_args__ = (
        UniqueConstraint(
            "feature_flag_id",
            "environment_id",
            "usage_date",
            name="uq_feature_usage_daily",
        ),
        Index(
            "ix_feature_usage_feature_id",
            "feature_flag_id",
        ),
        Index(
            "ix_feature_usage_environment_id",
            "environment_id",
        ),
        Index(
            "ix_feature_usage_date",
            "usage_date",
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

    usage_date: Mapped[date] = mapped_column(
        nullable=False,
    )

    evaluation_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    enabled_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    disabled_count: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
    )

    unique_user_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    feature_flag: Mapped["FeatureFlag"] = relationship(
        "FeatureFlag",
        back_populates="usage_records",
        lazy="joined",
    )