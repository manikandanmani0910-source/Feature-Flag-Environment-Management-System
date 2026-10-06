from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.core.constants import ScheduleStatus
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.feature_schedule import FeatureSchedule
from app.models.user_assignment import UserAssignment
from app.services.cache_service import CacheService


logger = logging.getLogger(__name__)


# ==================================================================
# EXCEPTIONS
# ==================================================================


class FeatureEvaluationError(Exception):
    """Base exception for feature evaluation."""


class EnvironmentNotFoundError(FeatureEvaluationError):
    """Raised when the requested environment does not exist."""


class FeatureNotFoundError(FeatureEvaluationError):
    """Raised when the requested feature does not exist."""


# ==================================================================
# DATA CLASSES
# ==================================================================


@dataclass(frozen=True)
class EvaluationContext:
    feature_key: str
    environment: str
    user_id: int | None = None


@dataclass(frozen=True)
class EvaluationResult:
    enabled: bool
    feature_key: str
    environment: str
    user_id: int | None
    reason: str
    source: str
    rollout_percentage: float | None = None
    evaluated_at: datetime | None = None
    cached: bool = False

    def as_dict(self) -> dict[str, Any]:
        return {
            "enabled": self.enabled,
            "feature_key": self.feature_key,
            "environment": self.environment,
            "user_id": self.user_id,
            "reason": self.reason,
            "source": self.source,
            "rollout_percentage": (
                self.rollout_percentage
            ),
            "evaluated_at": (
                self.evaluated_at.isoformat()
                if self.evaluated_at
                else None
            ),
            "cached": self.cached,
        }


# ==================================================================
# EVALUATION SERVICE
# ==================================================================


class EvaluationService:
    """
    Enterprise feature-flag evaluation engine.

    Evaluation priority:

        1. Feature existence
        2. Feature global activation
        3. Environment activation
        4. Scheduled activation/deactivation
        5. Explicit user assignment
        6. Percentage rollout
        7. Default disabled

    MySQL remains the source of truth.
    Redis is used only as a performance cache.
    """

    CACHE_TTL = 60

    def __init__(
        self,
        session: Session,
        cache_service: CacheService | None = None,
    ) -> None:
        self.session = session
        self.cache = (
            cache_service
            or CacheService()
        )

    # ==============================================================
    # PUBLIC API
    # ==============================================================

    def evaluate(
        self,
        *,
        feature_key: str,
        environment: str,
        user_id: int | None = None,
    ) -> EvaluationResult:

        feature_key = self._normalize_feature_key(
            feature_key
        )

        environment_name = (
            self._normalize_environment(
                environment
            )
        )

        # ----------------------------------------------------------
        # CACHE
        # ----------------------------------------------------------

        cached = self.cache.get_evaluation(
            feature_key=feature_key,
            environment=environment_name,
            user_id=user_id,
        )

        if cached is not None:
            return self._result_from_cache(
                cached,
                feature_key=feature_key,
                environment=environment_name,
                user_id=user_id,
            )

        # ----------------------------------------------------------
        # FEATURE
        # ----------------------------------------------------------

        feature = self._get_feature(
            feature_key
        )

        if feature is None:
            raise FeatureNotFoundError(
                f"Feature flag '{feature_key}' "
                "was not found."
            )

        # ----------------------------------------------------------
        # GLOBAL FEATURE STATE
        # ----------------------------------------------------------

        if not feature.is_active:
            return self._store_result(
                self._build_result(
                    enabled=False,
                    feature_key=feature_key,
                    environment=environment_name,
                    user_id=user_id,
                    reason="feature_disabled",
                    source="feature_flag",
                )
            )

        # ----------------------------------------------------------
        # ENVIRONMENT
        # ----------------------------------------------------------

        environment_obj = self._get_environment(
            environment_name
        )

        if environment_obj is None:
            raise EnvironmentNotFoundError(
                f"Environment '{environment_name}' "
                "was not found."
            )

        if not environment_obj.is_active:
            return self._store_result(
                self._build_result(
                    enabled=False,
                    feature_key=feature_key,
                    environment=environment_name,
                    user_id=user_id,
                    reason="environment_disabled",
                    source="environment",
                )
            )

        # ----------------------------------------------------------
        # SCHEDULE
        # ----------------------------------------------------------

        schedule_result = (
            self._evaluate_schedule(
                feature_id=feature.id,
                environment_id=environment_obj.id,
            )
        )

        if schedule_result is not None:
            return self._store_result(
                self._build_result(
                    enabled=schedule_result[0],
                    feature_key=feature_key,
                    environment=environment_name,
                    user_id=user_id,
                    reason=schedule_result[1],
                    source="schedule",
                )
            )

        # ----------------------------------------------------------
        # USER ASSIGNMENT
        # ----------------------------------------------------------

        if user_id is not None:
            assignment = (
                self._get_user_assignment(
                    feature_id=feature.id,
                    environment_id=environment_obj.id,
                    user_id=user_id,
                )
            )

            if assignment is not None:
                enabled = bool(
                    assignment.is_enabled
                )

                return self._store_result(
                    self._build_result(
                        enabled=enabled,
                        feature_key=feature_key,
                        environment=environment_name,
                        user_id=user_id,
                        reason=(
                            "user_assignment_enabled"
                            if enabled
                            else "user_assignment_disabled"
                        ),
                        source="user_assignment",
                    )
                )

        # ----------------------------------------------------------
        # PERCENTAGE ROLLOUT
        # ----------------------------------------------------------

        rollout = self._get_rollout(
            feature_id=feature.id,
            environment_id=environment_obj.id,
        )

        if rollout is not None:

            percentage = (
                self._get_rollout_percentage(
                    rollout
                )
            )

            if not rollout.is_enabled:
                return self._store_result(
                    self._build_result(
                        enabled=False,
                        feature_key=feature_key,
                        environment=environment_name,
                        user_id=user_id,
                        reason="rollout_disabled",
                        source="rollout",
                        rollout_percentage=percentage,
                    )
                )

            if percentage <= 0:
                return self._store_result(
                    self._build_result(
                        enabled=False,
                        feature_key=feature_key,
                        environment=environment_name,
                        user_id=user_id,
                        reason="rollout_zero_percent",
                        source="rollout",
                        rollout_percentage=percentage,
                    )
                )

            if percentage >= 100:
                return self._store_result(
                    self._build_result(
                        enabled=True,
                        feature_key=feature_key,
                        environment=environment_name,
                        user_id=user_id,
                        reason="rollout_full",
                        source="rollout",
                        rollout_percentage=percentage,
                    )
                )

            if user_id is None:
                return self._store_result(
                    self._build_result(
                        enabled=False,
                        feature_key=feature_key,
                        environment=environment_name,
                        user_id=None,
                        reason="rollout_requires_user",
                        source="rollout",
                        rollout_percentage=percentage,
                    )
                )

            bucket = self._calculate_bucket(
                feature_key=feature_key,
                environment=environment_name,
                user_id=user_id,
            )

            enabled = bucket < percentage

            return self._store_result(
                self._build_result(
                    enabled=enabled,
                    feature_key=feature_key,
                    environment=environment_name,
                    user_id=user_id,
                    reason=(
                        "percentage_rollout_enabled"
                        if enabled
                        else "percentage_rollout_excluded"
                    ),
                    source="percentage_rollout",
                    rollout_percentage=percentage,
                )
            )

        # ----------------------------------------------------------
        # DEFAULT
        # ----------------------------------------------------------

        return self._store_result(
            self._build_result(
                enabled=False,
                feature_key=feature_key,
                environment=environment_name,
                user_id=user_id,
                reason="no_rollout_configuration",
                source="default",
            )
        )

    # ==============================================================
    # BULK EVALUATION
    # ==============================================================

    def evaluate_many(
        self,
        *,
        feature_keys: list[str],
        environment: str,
        user_id: int | None = None,
    ) -> dict[str, EvaluationResult]:

        results: dict[
            str,
            EvaluationResult,
        ] = {}

        for feature_key in feature_keys:
            try:
                results[feature_key] = (
                    self.evaluate(
                        feature_key=feature_key,
                        environment=environment,
                        user_id=user_id,
                    )
                )

            except FeatureEvaluationError:
                logger.exception(
                    "Feature evaluation failed "
                    "for '%s'.",
                    feature_key,
                )

        return results

    # ==============================================================
    # CACHE INVALIDATION
    # ==============================================================

    def invalidate(
        self,
        *,
        feature_key: str,
        environment: str,
    ) -> None:

        feature_key = (
            self._normalize_feature_key(
                feature_key
            )
        )

        environment = (
            self._normalize_environment(
                environment
            )
        )

        self.cache.invalidate_feature_everywhere(
            feature_key=feature_key,
            environment=environment,
        )

    # ==============================================================
    # FEATURE LOOKUP
    # ==============================================================

    def _get_feature(
        self,
        feature_key: str,
    ) -> FeatureFlag | None:

        statement = (
            select(FeatureFlag)
            .where(
                FeatureFlag.key
                == feature_key
            )
            .limit(1)
        )

        return (
            self.session.execute(
                statement
            )
            .scalar_one_or_none()
        )

    # ==============================================================
    # ENVIRONMENT LOOKUP
    # ==============================================================

    def _get_environment(
        self,
        environment: str,
    ) -> Environment | None:

        statement = (
            select(Environment)
            .where(
                Environment.name
                == environment
            )
            .limit(1)
        )

        return (
            self.session.execute(
                statement
            )
            .scalar_one_or_none()
        )

    # ==============================================================
    # SCHEDULE EVALUATION
    # ==============================================================

    def _evaluate_schedule(
        self,
        *,
        feature_id: int,
        environment_id: int,
    ) -> tuple[bool, str] | None:

        statement = (
            select(FeatureSchedule)
            .where(
                and_(
                    FeatureSchedule.feature_flag_id
                    == feature_id,
                    FeatureSchedule.environment_id
                    == environment_id,
                )
            )
            .order_by(
                FeatureSchedule.start_time.desc()
            )
            .limit(1)
        )

        schedule = (
            self.session.execute(
                statement
            )
            .scalar_one_or_none()
        )

        if schedule is None:
            return None

        now = datetime.now(
            timezone.utc
        )

        start_time = self._ensure_utc(
            schedule.start_time
        )

        end_time = (
            self._ensure_utc(
                schedule.end_time
            )
            if schedule.end_time is not None
            else None
        )

        # ----------------------------------------------------------
        # CANCELLED / INVALID SCHEDULE
        # ----------------------------------------------------------

        if (
            schedule.status
            == ScheduleStatus.CANCELLED.value
        ):
            return None

        # ----------------------------------------------------------
        # BEFORE START
        # ----------------------------------------------------------

        if now < start_time:
            return (
                False,
                "scheduled_activation_pending",
            )

        # ----------------------------------------------------------
        # AFTER END
        # ----------------------------------------------------------

        if (
            end_time is not None
            and now >= end_time
        ):
            return (
                False,
                "scheduled_deactivation_active",
            )

        # ----------------------------------------------------------
        # ACTIVE WINDOW
        # ----------------------------------------------------------

        return (
            True,
            "schedule_active",
        )

    # ==============================================================
    # USER ASSIGNMENT
    # ==============================================================

    def _get_user_assignment(
        self,
        *,
        feature_id: int,
        environment_id: int,
        user_id: int,
    ) -> UserAssignment | None:

        # UserAssignment is linked to a FeatureRollout.
        # Therefore we first join through FeatureRollout.

        statement = (
            select(UserAssignment)
            .join(
                FeatureRollout,
                UserAssignment.feature_rollout_id
                == FeatureRollout.id,
            )
            .where(
                and_(
                    FeatureRollout.feature_flag_id
                    == feature_id,
                    FeatureRollout.environment_id
                    == environment_id,
                    UserAssignment.user_id
                    == user_id,
                )
            )
            .limit(1)
        )

        return (
            self.session.execute(
                statement
            )
            .scalar_one_or_none()
        )

    # ==============================================================
    # ROLLOUT
    # ==============================================================

    def _get_rollout(
        self,
        *,
        feature_id: int,
        environment_id: int,
    ) -> FeatureRollout | None:

        statement = (
            select(FeatureRollout)
            .where(
                and_(
                    FeatureRollout.feature_flag_id
                    == feature_id,
                    FeatureRollout.environment_id
                    == environment_id,
                )
            )
            .order_by(
                FeatureRollout.created_at.desc()
            )
            .limit(1)
        )

        return (
            self.session.execute(
                statement
            )
            .scalar_one_or_none()
        )

    @staticmethod
    def _get_rollout_percentage(
        rollout: FeatureRollout,
    ) -> float:

        try:
            percentage = float(
                rollout.rollout_percentage
            )
        except (
            TypeError,
            ValueError,
        ):
            percentage = 0.0

        return max(
            0.0,
            min(
                100.0,
                percentage,
            ),
        )

    # ==============================================================
    # DETERMINISTIC ROLLOUT
    # ==============================================================

    @staticmethod
    def _calculate_bucket(
        *,
        feature_key: str,
        environment: str,
        user_id: int,
    ) -> float:

        seed = (
            f"{feature_key}:"
            f"{environment}:"
            f"{user_id}"
        )

        digest = hashlib.sha256(
            seed.encode("utf-8")
        ).hexdigest()

        numeric_value = int(
            digest[:16],
            16,
        )

        return (
            numeric_value % 10_000
        ) / 100

    # ==============================================================
    # RESULT CREATION
    # ==============================================================

    @staticmethod
    def _build_result(
        *,
        enabled: bool,
        feature_key: str,
        environment: str,
        user_id: int | None,
        reason: str,
        source: str,
        rollout_percentage: float | None = None,
    ) -> EvaluationResult:

        return EvaluationResult(
            enabled=enabled,
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
            reason=reason,
            source=source,
            rollout_percentage=rollout_percentage,
            evaluated_at=datetime.now(
                timezone.utc
            ),
            cached=False,
        )

    def _store_result(
        self,
        result: EvaluationResult,
    ) -> EvaluationResult:

        self.cache.set_evaluation(
            feature_key=result.feature_key,
            environment=result.environment,
            user_id=result.user_id,
            result=result.as_dict(),
            ttl=self.CACHE_TTL,
        )

        return result

    # ==============================================================
    # CACHE RESULT
    # ==============================================================

    @staticmethod
    def _result_from_cache(
        cached: dict[str, Any],
        *,
        feature_key: str,
        environment: str,
        user_id: int | None,
    ) -> EvaluationResult:

        evaluated_at = cached.get(
            "evaluated_at"
        )

        parsed_datetime: datetime | None = None

        if evaluated_at:
            try:
                parsed_datetime = (
                    datetime.fromisoformat(
                        evaluated_at
                    )
                )
            except (
                TypeError,
                ValueError,
            ):
                parsed_datetime = None

        rollout_percentage = (
            float(
                cached[
                    "rollout_percentage"
                ]
            )
            if cached.get(
                "rollout_percentage"
            )
            is not None
            else None
        )

        return EvaluationResult(
            enabled=bool(
                cached.get(
                    "enabled",
                    False,
                )
            ),
            feature_key=feature_key,
            environment=environment,
            user_id=user_id,
            reason=str(
                cached.get(
                    "reason",
                    "cached_result",
                )
            ),
            source=str(
                cached.get(
                    "source",
                    "cache",
                )
            ),
            rollout_percentage=(
                rollout_percentage
            ),
            evaluated_at=parsed_datetime,
            cached=True,
        )

    # ==============================================================
    # NORMALIZATION
    # ==============================================================

    @staticmethod
    def _normalize_feature_key(
        value: str,
    ) -> str:

        if not isinstance(
            value,
            str,
        ):
            raise ValueError(
                "Feature key must be a string."
            )

        value = value.strip().lower()

        if not value:
            raise ValueError(
                "Feature key cannot be empty."
            )

        if len(value) > 255:
            raise ValueError(
                "Feature key cannot exceed "
                "255 characters."
            )

        return value

    @staticmethod
    def _normalize_environment(
        value: str,
    ) -> str:

        if not isinstance(
            value,
            str,
        ):
            raise ValueError(
                "Environment must be a string."
            )

        value = value.strip().lower()

        if not value:
            raise ValueError(
                "Environment cannot be empty."
            )

        return value

    # ==============================================================
    # TIMEZONE
    # ==============================================================

    @staticmethod
    def _ensure_utc(
        value: datetime,
    ) -> datetime:

        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc
            )

        return value.astimezone(
            timezone.utc
        )