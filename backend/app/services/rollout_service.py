from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.services.cache_service import CacheService


class RolloutServiceError(Exception):
    """Base exception for rollout operations."""


class RolloutNotFoundError(RolloutServiceError):
    """Raised when a rollout does not exist."""


class RolloutValidationError(RolloutServiceError):
    """Raised when rollout configuration is invalid."""


class RolloutConflictError(RolloutServiceError):
    """Raised when rollout configuration conflicts."""


class FeatureNotFoundForRolloutError(RolloutServiceError):
    """Raised when the feature does not exist."""


class RolloutService:
    """
    Enterprise gradual-rollout management service.

    Responsibilities:
    - Create percentage-based rollouts
    - Update rollout percentages
    - Enable / disable rollouts
    - Validate 0-100 percentage boundaries
    - Maintain feature/environment isolation
    - Prevent duplicate active rollout configurations
    - Invalidate evaluation caches after changes
    - Generate audit-ready snapshots
    """

    MIN_PERCENTAGE = Decimal("0")
    MAX_PERCENTAGE = Decimal("100")

    def __init__(
        self,
        session: Session,
        cache_service: CacheService | None = None,
    ) -> None:
        self.session = session
        self.cache = cache_service or CacheService()

    # ================================================================
    # CREATE
    # ================================================================

    def create(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        percentage: Decimal | float | int,
        is_active: bool = True,
    ) -> FeatureRollout:

        normalized_percentage = (
            self._validate_percentage(
                percentage
            )
        )

        feature = self._get_feature(
            feature_flag_id
        )

        if feature is None:
            raise FeatureNotFoundForRolloutError(
                f"Feature flag {feature_flag_id} "
                "does not exist."
            )

        existing = self._get_existing_rollout(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
        )

        if existing is not None:
            raise RolloutConflictError(
                "A rollout already exists for "
                f"feature {feature_flag_id} in "
                f"environment {environment_id}."
            )

        rollout = FeatureRollout(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            percentage=normalized_percentage,
            is_active=is_active,
        )

        self.session.add(rollout)

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise RolloutConflictError(
                "Rollout configuration violates "
                "a database constraint."
            ) from exc

        self.session.refresh(rollout)

        self._invalidate_cache(
            feature=feature,
            environment_id=environment_id,
        )

        return rollout

    # ================================================================
    # GET
    # ================================================================

    def get(
        self,
        rollout_id: int,
    ) -> FeatureRollout:

        statement = (
            select(FeatureRollout)
            .where(
                FeatureRollout.id
                == rollout_id
            )
            .limit(1)
        )

        rollout = self.session.execute(
            statement
        ).scalar_one_or_none()

        if rollout is None:
            raise RolloutNotFoundError(
                f"Rollout {rollout_id} "
                "was not found."
            )

        return rollout

    # ================================================================
    # GET BY FEATURE + ENVIRONMENT
    # ================================================================

    def get_for_feature(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureRollout | None:

        return self._get_existing_rollout(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
        )

    # ================================================================
    # LIST
    # ================================================================

    def list(
        self,
        *,
        feature_flag_id: int | None = None,
        environment_id: int | None = None,
        is_active: bool | None = None,
    ) -> list[FeatureRollout]:

        conditions: list[Any] = []

        if feature_flag_id is not None:
            conditions.append(
                FeatureRollout.feature_flag_id
                == feature_flag_id
            )

        if environment_id is not None:
            conditions.append(
                FeatureRollout.environment_id
                == environment_id
            )

        if is_active is not None:
            conditions.append(
                FeatureRollout.is_active
                == is_active
            )

        statement = (
            select(FeatureRollout)
            .where(*conditions)
            .order_by(
                FeatureRollout.id.desc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # UPDATE PERCENTAGE
    # ================================================================

    def update_percentage(
        self,
        *,
        rollout_id: int,
        percentage: Decimal | float | int,
    ) -> FeatureRollout:

        rollout = self.get(
            rollout_id
        )

        normalized_percentage = (
            self._validate_percentage(
                percentage
            )
        )

        rollout.percentage = (
            normalized_percentage
        )

        self.session.commit()
        self.session.refresh(rollout)

        self._invalidate_rollout_cache(
            rollout
        )

        return rollout

    # ================================================================
    # UPDATE
    # ================================================================

    def update(
        self,
        *,
        rollout_id: int,
        percentage: Decimal | float | int | None = None,
        is_active: bool | None = None,
    ) -> FeatureRollout:

        rollout = self.get(
            rollout_id
        )

        if percentage is not None:
            rollout.percentage = (
                self._validate_percentage(
                    percentage
                )
            )

        if is_active is not None:
            rollout.is_active = (
                is_active
            )

        self.session.commit()
        self.session.refresh(rollout)

        self._invalidate_rollout_cache(
            rollout
        )

        return rollout

    # ================================================================
    # ACTIVATE
    # ================================================================

    def activate(
        self,
        rollout_id: int,
    ) -> FeatureRollout:

        rollout = self.get(
            rollout_id
        )

        if rollout.is_active:
            return rollout

        rollout.is_active = True

        self.session.commit()
        self.session.refresh(rollout)

        self._invalidate_rollout_cache(
            rollout
        )

        return rollout

    # ================================================================
    # DEACTIVATE
    # ================================================================

    def deactivate(
        self,
        rollout_id: int,
    ) -> FeatureRollout:

        rollout = self.get(
            rollout_id
        )

        if not rollout.is_active:
            return rollout

        rollout.is_active = False

        self.session.commit()
        self.session.refresh(rollout)

        self._invalidate_rollout_cache(
            rollout
        )

        return rollout

    # ================================================================
    # DELETE
    # ================================================================

    def delete(
        self,
        rollout_id: int,
    ) -> None:

        rollout = self.get(
            rollout_id
        )

        feature = self._get_feature(
            rollout.feature_flag_id
        )

        environment_id = (
            rollout.environment_id
        )

        self.session.delete(
            rollout
        )

        self.session.commit()

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=environment_id,
            )

    # ================================================================
    # SET FULL ROLLOUT
    # ================================================================

    def enable_for_everyone(
        self,
        rollout_id: int,
    ) -> FeatureRollout:

        return self.update(
            rollout_id=rollout_id,
            percentage=Decimal("100"),
            is_active=True,
        )

    # ================================================================
    # DISABLE FOR EVERYONE
    # ================================================================

    def disable_for_everyone(
        self,
        rollout_id: int,
    ) -> FeatureRollout:

        return self.update(
            rollout_id=rollout_id,
            percentage=Decimal("0"),
            is_active=True,
        )

    # ================================================================
    # ROLLBACK
    # ================================================================

    def rollback(
        self,
        *,
        rollout_id: int,
        previous_percentage: Decimal | float | int,
    ) -> FeatureRollout:

        rollout = self.get(
            rollout_id
        )

        normalized_percentage = (
            self._validate_percentage(
                previous_percentage
            )
        )

        rollout.percentage = (
            normalized_percentage
        )

        rollout.is_active = True

        self.session.commit()
        self.session.refresh(rollout)

        self._invalidate_rollout_cache(
            rollout
        )

        return rollout

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(
        rollout: FeatureRollout,
    ) -> dict[str, Any]:

        percentage = getattr(
            rollout,
            "percentage",
            None,
        )

        if percentage is not None:
            percentage = float(
                percentage
            )

        return {
            "id": getattr(
                rollout,
                "id",
                None,
            ),
            "feature_flag_id": getattr(
                rollout,
                "feature_flag_id",
                None,
            ),
            "environment_id": getattr(
                rollout,
                "environment_id",
                None,
            ),
            "percentage": percentage,
            "is_active": getattr(
                rollout,
                "is_active",
                None,
            ),
            "created_at": (
                rollout.created_at.isoformat()
                if getattr(
                    rollout,
                    "created_at",
                    None,
                )
                is not None
                else None
            ),
            "updated_at": (
                rollout.updated_at.isoformat()
                if getattr(
                    rollout,
                    "updated_at",
                    None,
                )
                is not None
                else None
            ),
        }

    # ================================================================
    # INTERNAL LOOKUP
    # ================================================================

    def _get_existing_rollout(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureRollout | None:

        statement = (
            select(FeatureRollout)
            .where(
                and_(
                    FeatureRollout.feature_flag_id
                    == feature_flag_id,
                    FeatureRollout.environment_id
                    == environment_id,
                )
            )
            .order_by(
                FeatureRollout.id.desc()
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def _get_feature(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag | None:

        statement = (
            select(FeatureFlag)
            .where(
                FeatureFlag.id
                == feature_flag_id
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # VALIDATION
    # ================================================================

    @classmethod
    def _validate_percentage(
        cls,
        value: Decimal | float | int,
    ) -> Decimal:

        try:
            percentage = Decimal(
                str(value)
            )
        except (
            TypeError,
            ValueError,
        ) as exc:
            raise RolloutValidationError(
                "Rollout percentage must be "
                "a valid number."
            ) from exc

        if not percentage.is_finite():
            raise RolloutValidationError(
                "Rollout percentage must be finite."
            )

        if (
            percentage < cls.MIN_PERCENTAGE
            or percentage > cls.MAX_PERCENTAGE
        ):
            raise RolloutValidationError(
                "Rollout percentage must be "
                "between 0 and 100."
            )

        return percentage.quantize(
            Decimal("0.01")
        )

    # ================================================================
    # CACHE INVALIDATION
    # ================================================================

    def _invalidate_rollout_cache(
        self,
        rollout: FeatureRollout,
    ) -> None:

        feature = self._get_feature(
            rollout.feature_flag_id
        )

        if feature is None:
            return

        self._invalidate_cache(
            feature=feature,
            environment_id=rollout.environment_id,
        )

    def _invalidate_cache(
        self,
        *,
        feature: FeatureFlag,
        environment_id: int,
    ) -> None:
        """
        Invalidate feature evaluation state.

        Environment ID is part of the database relationship.
        The environment name is resolved separately when required
        by Redis.
        """

        environment_name = self._resolve_environment_name(
            environment_id
        )

        if environment_name:
            self.cache.invalidate_feature_everywhere(
                feature_key=feature.key,
                environment=environment_name,
            )
        else:
            self.cache.invalidate_dashboard()

    def _resolve_environment_name(
        self,
        environment_id: int,
    ) -> str | None:

        from app.models.environment import Environment

        statement = (
            select(Environment.name)
            .where(
                Environment.id
                == environment_id
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()