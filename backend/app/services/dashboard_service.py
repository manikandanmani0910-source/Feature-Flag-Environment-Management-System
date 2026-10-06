from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.feature_schedule import FeatureSchedule
from app.models.feature_usage import FeatureUsage
from app.models.user import User


class DashboardService:
    """
    Service responsible for preparing dashboard-level information.

    Keeps dashboard aggregation separate from individual business
    services such as feature flag, rollout, schedule and analytics.
    """

    def __init__(self, session: Session) -> None:
        self.session = session

    # ================================================================
    # DASHBOARD SUMMARY
    # ================================================================

    def get_summary(self) -> dict[str, Any]:
        """
        Return the main dashboard counters.
        """

        return {
            "features": self._count(FeatureFlag),
            "environments": self._count(Environment),
            "rollouts": self._count(FeatureRollout),
            "schedules": self._count(FeatureSchedule),
            "users": self._count(User),
            "usage_events": self._count(FeatureUsage),
            "audit_logs": self._count(AuditLog),
        }

    # ================================================================
    # COMPLETE DASHBOARD
    # ================================================================

    def get_dashboard(self) -> dict[str, Any]:
        """
        Return the complete dashboard payload.
        """

        return {
            "summary": self.get_summary(),
            "features": self.get_feature_overview(),
            "environments": self.get_environment_overview(),
            "rollouts": self.get_rollout_overview(),
            "schedules": self.get_schedule_overview(),
            "recent_activity": self.get_recent_activity(),
            "generated_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }

    # ================================================================
    # FEATURE OVERVIEW
    # ================================================================

    def get_feature_overview(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Return recently created feature flags.
        """

        if limit < 1:
            limit = 1

        if limit > 100:
            limit = 100

        statement = select(FeatureFlag)

        created_column = self._get_column(
            FeatureFlag,
            "created_at",
        )

        if created_column is not None:
            statement = statement.order_by(
                created_column.desc()
            )

        statement = statement.limit(limit)

        rows = self.session.execute(
            statement
        ).scalars().all()

        return [
            self._serialize_feature(flag)
            for flag in rows
        ]

    # ================================================================
    # ENVIRONMENT OVERVIEW
    # ================================================================

    def get_environment_overview(
        self,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Return available environments.
        """

        if limit < 1:
            limit = 1

        if limit > 100:
            limit = 100

        statement = select(Environment)

        created_column = self._get_column(
            Environment,
            "created_at",
        )

        if created_column is not None:
            statement = statement.order_by(
                created_column.desc()
            )

        statement = statement.limit(limit)

        rows = self.session.execute(
            statement
        ).scalars().all()

        return [
            self._serialize_environment(environment)
            for environment in rows
        ]

    # ================================================================
    # ROLLOUT OVERVIEW
    # ================================================================

    def get_rollout_overview(
        self,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Return rollout information for the dashboard.
        """

        if limit < 1:
            limit = 1

        if limit > 100:
            limit = 100

        statement = select(FeatureRollout)

        created_column = self._get_column(
            FeatureRollout,
            "created_at",
        )

        if created_column is not None:
            statement = statement.order_by(
                created_column.desc()
            )

        statement = statement.limit(limit)

        rows = self.session.execute(
            statement
        ).scalars().all()

        return [
            self._serialize_rollout(rollout)
            for rollout in rows
        ]

    # ================================================================
    # SCHEDULE OVERVIEW
    # ================================================================

    def get_schedule_overview(
        self,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Return feature schedules.
        """

        if limit < 1:
            limit = 1

        if limit > 100:
            limit = 100

        statement = select(FeatureSchedule)

        created_column = self._get_column(
            FeatureSchedule,
            "created_at",
        )

        if created_column is not None:
            statement = statement.order_by(
                created_column.desc()
            )

        statement = statement.limit(limit)

        rows = self.session.execute(
            statement
        ).scalars().all()

        return [
            self._serialize_schedule(schedule)
            for schedule in rows
        ]

    # ================================================================
    # RECENT ACTIVITY
    # ================================================================

    def get_recent_activity(
        self,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """
        Return recent audit log activity.
        """

        if limit < 1:
            limit = 1

        if limit > 100:
            limit = 100

        statement = select(AuditLog)

        timestamp_column = (
            self._get_column(
                AuditLog,
                "created_at",
            )
            or self._get_column(
                AuditLog,
                "timestamp",
            )
            or self._get_column(
                AuditLog,
                "logged_at",
            )
        )

        if timestamp_column is not None:
            statement = statement.order_by(
                timestamp_column.desc()
            )

        statement = statement.limit(limit)

        rows = self.session.execute(
            statement
        ).scalars().all()

        return [
            self._serialize_audit_log(log)
            for log in rows
        ]

    # ================================================================
    # FEATURE COUNTERS
    # ================================================================

    def get_feature_count(self) -> int:
        return self._count(FeatureFlag)

    def get_environment_count(self) -> int:
        return self._count(Environment)

    def get_rollout_count(self) -> int:
        return self._count(FeatureRollout)

    def get_schedule_count(self) -> int:
        return self._count(FeatureSchedule)

    def get_usage_count(self) -> int:
        return self._count(FeatureUsage)

    def get_user_count(self) -> int:
        return self._count(User)

    def get_audit_log_count(self) -> int:
        return self._count(AuditLog)

    # ================================================================
    # INTERNAL HELPERS
    # ================================================================

    def _count(
        self,
        model: Any,
    ) -> int:
        statement = select(
            func.count()
        ).select_from(model)

        result = self.session.execute(
            statement
        ).scalar_one()

        return int(result or 0)

    @staticmethod
    def _get_column(
        model: Any,
        name: str,
    ) -> Any | None:
        """
        Safely retrieve a SQLAlchemy model column.

        This prevents the dashboard from breaking if one model
        does not contain an optional timestamp field.
        """

        return getattr(
            model,
            name,
            None,
        )

    # ================================================================
    # SERIALIZERS
    # ================================================================

    @staticmethod
    def _serialize_feature(
        feature: Any,
    ) -> dict[str, Any]:
        return {
            "id": getattr(
                feature,
                "id",
                None,
            ),
            "key": getattr(
                feature,
                "key",
                None,
            ),
            "name": getattr(
                feature,
                "name",
                None,
            ),
            "description": getattr(
                feature,
                "description",
                None,
            ),
            "enabled": getattr(
                feature,
                "enabled",
                getattr(
                    feature,
                    "is_active",
                    None,
                ),
            ),
            "created_at": DashboardService._serialize_datetime(
                getattr(
                    feature,
                    "created_at",
                    None,
                )
            ),
            "updated_at": DashboardService._serialize_datetime(
                getattr(
                    feature,
                    "updated_at",
                    None,
                )
            ),
        }

    @staticmethod
    def _serialize_environment(
        environment: Any,
    ) -> dict[str, Any]:
        return {
            "id": getattr(
                environment,
                "id",
                None,
            ),
            "name": getattr(
                environment,
                "name",
                None,
            ),
            "key": getattr(
                environment,
                "key",
                None,
            ),
            "description": getattr(
                environment,
                "description",
                None,
            ),
            "created_at": DashboardService._serialize_datetime(
                getattr(
                    environment,
                    "created_at",
                    None,
                )
            ),
            "updated_at": DashboardService._serialize_datetime(
                getattr(
                    environment,
                    "updated_at",
                    None,
                )
            ),
        }

    @staticmethod
    def _serialize_rollout(
        rollout: Any,
    ) -> dict[str, Any]:
        percentage = getattr(
            rollout,
            "rollout_percentage",
            None,
        )

        if percentage is not None:
            percentage = str(percentage)

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
            "enabled": getattr(
                rollout,
                "is_enabled",
                None,
            ),
            "targeting_enabled": getattr(
                rollout,
                "targeting_enabled",
                None,
            ),
            "version": getattr(
                rollout,
                "version",
                None,
            ),
            "created_at": DashboardService._serialize_datetime(
                getattr(
                    rollout,
                    "created_at",
                    None,
                )
            ),
            "updated_at": DashboardService._serialize_datetime(
                getattr(
                    rollout,
                    "updated_at",
                    None,
                )
            ),
        }

    @staticmethod
    def _serialize_schedule(
        schedule: Any,
    ) -> dict[str, Any]:
        return {
            "id": getattr(
                schedule,
                "id",
                None,
            ),
            "feature_flag_id": getattr(
                schedule,
                "feature_flag_id",
                None,
            ),
            "environment_id": getattr(
                schedule,
                "environment_id",
                None,
            ),
            "start_time": DashboardService._serialize_datetime(
                getattr(
                    schedule,
                    "start_time",
                    None,
                )
            ),
            "end_time": DashboardService._serialize_datetime(
                getattr(
                    schedule,
                    "end_time",
                    None,
                )
            ),
            "status": getattr(
                schedule,
                "status",
                None,
            ),
        }

    @staticmethod
    def _serialize_audit_log(
        log: Any,
    ) -> dict[str, Any]:
        """
        Serialize AuditLog using the actual AuditLog model fields.

        IMPORTANT:
        Do not access log.metadata because SQLAlchemy models
        expose a metadata attribute containing SQLAlchemy MetaData.
        """

        return {
            "id": getattr(
                log,
                "id",
                None,
            ),
            "actor_id": getattr(
                log,
                "actor_id",
                None,
            ),
            "environment_id": getattr(
                log,
                "environment_id",
                None,
            ),
            "action": getattr(
                log,
                "action",
                None,
            ),
            "entity_type": getattr(
                log,
                "entity_type",
                None,
            ),
            "entity_id": getattr(
                log,
                "entity_id",
                None,
            ),
            "description": getattr(
                log,
                "description",
                None,
            ),
            "old_values": getattr(
                log,
                "old_values",
                None,
            ),
            "new_values": getattr(
                log,
                "new_values",
                None,
            ),
            "metadata_json": getattr(
                log,
                "metadata_json",
                None,
            ),
            "ip_address": getattr(
                log,
                "ip_address",
                None,
            ),
            "user_agent": getattr(
                log,
                "user_agent",
                None,
            ),
            "created_at": DashboardService._serialize_datetime(
                getattr(
                    log,
                    "created_at",
                    None,
                )
            ),
        }

    # ================================================================
    # DATETIME SERIALIZER
    # ================================================================

    @staticmethod
    def _serialize_datetime(
        value: Any,
    ) -> str | None:

        if value is None:
            return None

        if isinstance(
            value,
            datetime,
        ):
            return value.isoformat()

        return str(value)