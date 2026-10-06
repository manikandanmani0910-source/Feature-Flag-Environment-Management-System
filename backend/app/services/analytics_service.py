from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.feature_usage import FeatureUsage


class AnalyticsServiceError(Exception):
    """Base exception for analytics operations."""


class AnalyticsService:
    """
    Analytics service for the daily aggregate FeatureUsage model.

    FeatureUsage stores one record per:
        feature_flag + environment + usage_date

    Counters:
        evaluation_count
        enabled_count
        disabled_count
        unique_user_count
    """

    def __init__(self, session: Session) -> None:
        self.session = session

    # ================================================================
    # FEATURE STATISTICS
    # ================================================================

    def get_feature_statistics(
        self,
        *,
        feature_flag_id: int,
        environment_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict[str, Any]:

        conditions = self._build_usage_conditions(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

        totals = self._get_aggregates(
            conditions=conditions
        )

        evaluation_count = totals[
            "evaluation_count"
        ]

        enabled_count = totals[
            "enabled_count"
        ]

        disabled_count = totals[
            "disabled_count"
        ]

        unique_users = totals[
            "unique_user_count"
        ]

        adoption_rate = (
            enabled_count / evaluation_count * 100
            if evaluation_count > 0
            else 0.0
        )

        return {
            "feature_flag_id": feature_flag_id,
            "environment_id": environment_id,
            "total_evaluations": evaluation_count,
            "enabled_evaluations": enabled_count,
            "disabled_evaluations": disabled_count,
            "unique_users": unique_users,
            "adoption_rate": round(
                adoption_rate,
                2,
            ),
            "period": {
                "start": (
                    self._ensure_utc(
                        start_date
                    ).isoformat()
                    if start_date
                    else None
                ),
                "end": (
                    self._ensure_utc(
                        end_date
                    ).isoformat()
                    if end_date
                    else None
                ),
            },
        }

    # ================================================================
    # ENVIRONMENT STATISTICS
    # ================================================================

    def get_environment_statistics(
        self,
        *,
        environment_id: int,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict[str, Any]:

        conditions = self._build_usage_conditions(
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

        totals = self._get_aggregates(
            conditions=conditions
        )

        evaluation_count = totals[
            "evaluation_count"
        ]

        enabled_count = totals[
            "enabled_count"
        ]

        disabled_count = totals[
            "disabled_count"
        ]

        unique_users = totals[
            "unique_user_count"
        ]

        adoption_rate = (
            enabled_count / evaluation_count * 100
            if evaluation_count > 0
            else 0.0
        )

        return {
            "environment_id": environment_id,
            "total_evaluations": evaluation_count,
            "enabled_evaluations": enabled_count,
            "disabled_evaluations": disabled_count,
            "unique_users": unique_users,
            "adoption_rate": round(
                adoption_rate,
                2,
            ),
        }

    # ================================================================
    # DAILY USAGE
    # ================================================================

    def get_daily_usage(
        self,
        *,
        feature_flag_id: int | None = None,
        environment_id: int | None = None,
        days: int = 30,
    ) -> list[dict[str, Any]]:

        if days < 1:
            raise ValueError(
                "days must be greater than zero."
            )

        if days > 365:
            raise ValueError(
                "days cannot exceed 365."
            )

        end_date = date.today()
        start_date = (
            end_date - timedelta(days=days - 1)
        )

        conditions = [
            FeatureUsage.usage_date
            >= start_date,
            FeatureUsage.usage_date
            <= end_date,
        ]

        if feature_flag_id is not None:
            conditions.append(
                FeatureUsage.feature_flag_id
                == feature_flag_id
            )

        if environment_id is not None:
            conditions.append(
                FeatureUsage.environment_id
                == environment_id
            )

        statement = (
            select(
                FeatureUsage.usage_date,
                func.sum(
                    FeatureUsage.evaluation_count
                ).label(
                    "evaluation_count"
                ),
                func.sum(
                    FeatureUsage.enabled_count
                ).label(
                    "enabled_count"
                ),
                func.sum(
                    FeatureUsage.disabled_count
                ).label(
                    "disabled_count"
                ),
                func.sum(
                    FeatureUsage.unique_user_count
                ).label(
                    "unique_user_count"
                ),
            )
            .where(*conditions)
            .group_by(
                FeatureUsage.usage_date
            )
            .order_by(
                FeatureUsage.usage_date.asc()
            )
        )

        rows = self.session.execute(
            statement
        ).all()

        return [
            {
                "date": str(row.usage_date),
                "total": int(
                    row.evaluation_count or 0
                ),
                "enabled": int(
                    row.enabled_count or 0
                ),
                "disabled": int(
                    row.disabled_count or 0
                ),
                "unique_users": int(
                    row.unique_user_count or 0
                ),
            }
            for row in rows
        ]

    # ================================================================
    # TOP FEATURES
    # ================================================================

    def get_top_features(
        self,
        *,
        environment_id: int | None = None,
        limit: int = 10,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[dict[str, Any]]:

        if limit < 1 or limit > 100:
            raise ValueError(
                "limit must be between 1 and 100."
            )

        conditions = self._build_usage_conditions(
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

        statement = (
            select(
                FeatureUsage.feature_flag_id,
                FeatureFlag.key,
                FeatureFlag.name,
                func.sum(
                    FeatureUsage.evaluation_count
                ).label(
                    "evaluation_count"
                ),
                func.sum(
                    FeatureUsage.enabled_count
                ).label(
                    "enabled_count"
                ),
                func.sum(
                    FeatureUsage.disabled_count
                ).label(
                    "disabled_count"
                ),
                func.sum(
                    FeatureUsage.unique_user_count
                ).label(
                    "unique_user_count"
                ),
            )
            .join(
                FeatureFlag,
                FeatureFlag.id
                == FeatureUsage.feature_flag_id,
            )
            .where(*conditions)
            .group_by(
                FeatureUsage.feature_flag_id,
                FeatureFlag.key,
                FeatureFlag.name,
            )
            .order_by(
                func.sum(
                    FeatureUsage.evaluation_count
                ).desc()
            )
            .limit(limit)
        )

        rows = self.session.execute(
            statement
        ).all()

        return [
            {
                "feature_flag_id": row.feature_flag_id,
                "key": row.key,
                "name": row.name,
                "evaluation_count": int(
                    row.evaluation_count or 0
                ),
                "enabled_count": int(
                    row.enabled_count or 0
                ),
                "disabled_count": int(
                    row.disabled_count or 0
                ),
                "unique_users": int(
                    row.unique_user_count or 0
                ),
            }
            for row in rows
        ]

    # ================================================================
    # GLOBAL SUMMARY
    # ================================================================

    def get_global_summary(
        self,
        *,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict[str, Any]:

        conditions = self._build_usage_conditions(
            start_date=start_date,
            end_date=end_date,
        )

        totals = self._get_aggregates(
            conditions=conditions
        )

        evaluation_count = totals[
            "evaluation_count"
        ]

        enabled_count = totals[
            "enabled_count"
        ]

        disabled_count = totals[
            "disabled_count"
        ]

        unique_users = totals[
            "unique_user_count"
        ]

        active_features = self._count_distinct(
            FeatureUsage.feature_flag_id,
            conditions,
        )

        active_environments = self._count_distinct(
            FeatureUsage.environment_id,
            conditions,
        )

        adoption_rate = (
            enabled_count / evaluation_count * 100
            if evaluation_count > 0
            else 0.0
        )

        return {
            "total_evaluations": evaluation_count,
            "enabled_evaluations": enabled_count,
            "disabled_evaluations": disabled_count,
            "unique_users": unique_users,
            "active_features": active_features,
            "active_environments": active_environments,
            "adoption_rate": round(
                adoption_rate,
                2,
            ),
        }

    # ================================================================
    # ROLLOUT STATISTICS
    # ================================================================

    def get_rollout_statistics(
        self,
        *,
        feature_flag_id: int,
        environment_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> dict[str, Any]:

        statistics = self.get_feature_statistics(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            start_date=start_date,
            end_date=end_date,
        )

        total = statistics[
            "total_evaluations"
        ]

        enabled = statistics[
            "enabled_evaluations"
        ]

        disabled = statistics[
            "disabled_evaluations"
        ]

        rollout = self._get_rollout(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
        )

        configured_percentage = None
        rollout_enabled = None
        targeting_enabled = None
        version = None

        if rollout is not None:
            configured_percentage = float(
                rollout.rollout_percentage
            )

            rollout_enabled = bool(
                rollout.is_enabled
            )

            targeting_enabled = bool(
                rollout.targeting_enabled
            )

            version = rollout.version

        return {
            "feature_flag_id": feature_flag_id,
            "environment_id": environment_id,
            "evaluations": total,
            "enabled": enabled,
            "disabled": disabled,
            "enabled_percentage": round(
                (
                    enabled / total * 100
                    if total
                    else 0.0
                ),
                2,
            ),
            "disabled_percentage": round(
                (
                    disabled / total * 100
                    if total
                    else 0.0
                ),
                2,
            ),
            "unique_users": statistics[
                "unique_users"
            ],
            "configured_rollout_percentage": (
                configured_percentage
            ),
            "rollout_enabled": rollout_enabled,
            "targeting_enabled": targeting_enabled,
            "rollout_version": version,
        }

    # ================================================================
    # RECORD / UPSERT DAILY USAGE
    # ================================================================

    def record_usage(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        user_id: int | None = None,
        enabled: bool,
        reason: str | None = None,
    ) -> FeatureUsage:

        usage_date = date.today()

        statement = (
            select(FeatureUsage)
            .where(
                FeatureUsage.feature_flag_id
                == feature_flag_id,
                FeatureUsage.environment_id
                == environment_id,
                FeatureUsage.usage_date
                == usage_date,
            )
            .limit(1)
        )

        usage = self.session.execute(
            statement
        ).scalar_one_or_none()

        if usage is None:
            usage = FeatureUsage(
                feature_flag_id=feature_flag_id,
                environment_id=environment_id,
                usage_date=usage_date,
                evaluation_count=0,
                enabled_count=0,
                disabled_count=0,
                unique_user_count=0,
            )

            self.session.add(usage)

        usage.evaluation_count += 1

        if enabled:
            usage.enabled_count += 1
        else:
            usage.disabled_count += 1

        # ------------------------------------------------------------
        # IMPORTANT:
        # The current FeatureUsage model only stores an aggregate
        # unique_user_count. It does not store user_id.
        #
        # Therefore we cannot calculate exact unique users here.
        # We only increment it when a user_id is supplied, which
        # represents an approximate counter rather than a true
        # distinct-user calculation.
        # ------------------------------------------------------------

        if user_id is not None:
            usage.unique_user_count += 1

        self.session.flush()

        return usage

    # ================================================================
    # INTERNAL HELPERS
    # ================================================================

    def _build_usage_conditions(
        self,
        *,
        feature_flag_id: int | None = None,
        environment_id: int | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[Any]:

        conditions: list[Any] = []

        if feature_flag_id is not None:
            conditions.append(
                FeatureUsage.feature_flag_id
                == feature_flag_id
            )

        if environment_id is not None:
            conditions.append(
                FeatureUsage.environment_id
                == environment_id
            )

        if start_date is not None:
            conditions.append(
                FeatureUsage.usage_date
                >= self._to_date(start_date)
            )

        if end_date is not None:
            conditions.append(
                FeatureUsage.usage_date
                <= self._to_date(end_date)
            )

        return conditions

    # ================================================================
    # AGGREGATES
    # ================================================================

    def _get_aggregates(
        self,
        *,
        conditions: list[Any],
    ) -> dict[str, int]:

        statement = select(
            func.coalesce(
                func.sum(
                    FeatureUsage.evaluation_count
                ),
                0,
            ).label(
                "evaluation_count"
            ),
            func.coalesce(
                func.sum(
                    FeatureUsage.enabled_count
                ),
                0,
            ).label(
                "enabled_count"
            ),
            func.coalesce(
                func.sum(
                    FeatureUsage.disabled_count
                ),
                0,
            ).label(
                "disabled_count"
            ),
            func.coalesce(
                func.sum(
                    FeatureUsage.unique_user_count
                ),
                0,
            ).label(
                "unique_user_count"
            ),
        ).where(*conditions)

        row = self.session.execute(
            statement
        ).one()

        return {
            "evaluation_count": int(
                row.evaluation_count or 0
            ),
            "enabled_count": int(
                row.enabled_count or 0
            ),
            "disabled_count": int(
                row.disabled_count or 0
            ),
            "unique_user_count": int(
                row.unique_user_count or 0
            ),
        }

    # ================================================================
    # DISTINCT COUNT
    # ================================================================

    def _count_distinct(
        self,
        column: Any,
        conditions: list[Any],
    ) -> int:

        statement = (
            select(
                func.count(
                    func.distinct(column)
                )
            )
            .where(*conditions)
        )

        value = self.session.execute(
            statement
        ).scalar_one()

        return int(value or 0)

    # ================================================================
    # ROLLOUT LOOKUP
    # ================================================================

    def _get_rollout(
        self,
        *,
        feature_flag_id: int,
        environment_id: int | None,
    ) -> FeatureRollout | None:

        if environment_id is None:
            return None

        statement = (
            select(FeatureRollout)
            .where(
                FeatureRollout.feature_flag_id
                == feature_flag_id,
                FeatureRollout.environment_id
                == environment_id,
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # DATE HELPERS
    # ================================================================

    @staticmethod
    def _to_date(
        value: datetime,
    ) -> date:

        value = AnalyticsService._ensure_utc(
            value
        )

        return value.date()

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