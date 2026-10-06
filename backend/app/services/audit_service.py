from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditServiceError(Exception):
    """Base exception for audit operations."""


class AuditLogNotFoundError(AuditServiceError):
    """Raised when an audit log cannot be found."""


class AuditService:
    """
    Centralized immutable audit service.

    Records:
    - Who performed an operation
    - What resource was changed
    - What action was performed
    - Previous state
    - New state
    - Request metadata
    - Timestamp
    """

    def __init__(self, session: Session) -> None:
        self.session = session

    # ================================================================
    # CREATE AUDIT LOG
    # ================================================================

    def record(
        self,
        *,
        user_id: int | None,
        action: str,
        resource_type: str,
        resource_id: int | str | None = None,
        old_values: dict[str, Any] | None = None,
        new_values: dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AuditLog:
        """
        Persist an audit event.

        Audit records are append-only.
        Existing audit records must never be modified
        as part of normal application operations.
        """

        action = self._normalize_action(action)
        resource_type = self._normalize_resource_type(
            resource_type
        )

        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=(
                str(resource_id)
                if resource_id is not None
                else None
            ),
            old_values=self._serialize_json(
                old_values
            ),
            new_values=self._serialize_json(
                new_values
            ),
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
            metadata=self._serialize_json(
                metadata
            ),
            created_at=datetime.now(
                timezone.utc
            ),
        )

        self.session.add(audit_log)
        self.session.flush()

        return audit_log

    # ================================================================
    # FEATURE FLAG CHANGE
    # ================================================================

    def record_feature_change(
        self,
        *,
        user_id: int | None,
        action: str,
        feature_flag_id: int,
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> AuditLog:
        return self.record(
            user_id=user_id,
            action=action,
            resource_type="feature_flag",
            resource_id=feature_flag_id,
            old_values=before,
            new_values=after,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    # ================================================================
    # ROLLOUT CHANGE
    # ================================================================

    def record_rollout_change(
        self,
        *,
        user_id: int | None,
        action: str,
        rollout_id: int,
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> AuditLog:
        return self.record(
            user_id=user_id,
            action=action,
            resource_type="feature_rollout",
            resource_id=rollout_id,
            old_values=before,
            new_values=after,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    # ================================================================
    # SCHEDULE CHANGE
    # ================================================================

    def record_schedule_change(
        self,
        *,
        user_id: int | None,
        action: str,
        schedule_id: int,
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> AuditLog:
        return self.record(
            user_id=user_id,
            action=action,
            resource_type="feature_schedule",
            resource_id=schedule_id,
            old_values=before,
            new_values=after,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    # ================================================================
    # USER ASSIGNMENT CHANGE
    # ================================================================

    def record_assignment_change(
        self,
        *,
        user_id: int | None,
        action: str,
        assignment_id: int,
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> AuditLog:
        return self.record(
            user_id=user_id,
            action=action,
            resource_type="user_assignment",
            resource_id=assignment_id,
            old_values=before,
            new_values=after,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    # ================================================================
    # ENVIRONMENT CHANGE
    # ================================================================

    def record_environment_change(
        self,
        *,
        user_id: int | None,
        action: str,
        environment_id: int,
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_id: str | None = None,
    ) -> AuditLog:
        return self.record(
            user_id=user_id,
            action=action,
            resource_type="environment",
            resource_id=environment_id,
            old_values=before,
            new_values=after,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
        )

    # ================================================================
    # READ SINGLE LOG
    # ================================================================

    def get(
        self,
        audit_log_id: int,
    ) -> AuditLog:
        statement = (
            select(AuditLog)
            .where(
                AuditLog.id == audit_log_id
            )
            .limit(1)
        )

        audit_log = self.session.execute(
            statement
        ).scalar_one_or_none()

        if audit_log is None:
            raise AuditLogNotFoundError(
                f"Audit log {audit_log_id} "
                "was not found."
            )

        return audit_log

    # ================================================================
    # LIST LOGS
    # ================================================================

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 50,
        user_id: int | None = None,
        action: str | None = None,
        resource_type: str | None = None,
        resource_id: int | str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> list[AuditLog]:

        if page < 1:
            raise ValueError(
                "page must be greater than zero."
            )

        if page_size < 1 or page_size > 200:
            raise ValueError(
                "page_size must be between 1 and 200."
            )

        conditions = []

        if user_id is not None:
            conditions.append(
                AuditLog.user_id == user_id
            )

        if action is not None:
            conditions.append(
                AuditLog.action
                == self._normalize_action(action)
            )

        if resource_type is not None:
            conditions.append(
                AuditLog.resource_type
                == self._normalize_resource_type(
                    resource_type
                )
            )

        if resource_id is not None:
            conditions.append(
                AuditLog.resource_id
                == str(resource_id)
            )

        if start_date is not None:
            conditions.append(
                AuditLog.created_at
                >= self._ensure_utc(start_date)
            )

        if end_date is not None:
            conditions.append(
                AuditLog.created_at
                <= self._ensure_utc(end_date)
            )

        statement = (
            select(AuditLog)
            .where(*conditions)
            .order_by(
                AuditLog.created_at.desc()
            )
            .offset(
                (page - 1) * page_size
            )
            .limit(page_size)
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # RESOURCE HISTORY
    # ================================================================

    def history(
        self,
        *,
        resource_type: str,
        resource_id: int | str,
        page: int = 1,
        page_size: int = 50,
    ) -> list[AuditLog]:

        return self.list(
            page=page,
            page_size=page_size,
            resource_type=resource_type,
            resource_id=resource_id,
        )

    # ================================================================
    # FEATURE HISTORY
    # ================================================================

    def feature_history(
        self,
        *,
        feature_flag_id: int,
        page: int = 1,
        page_size: int = 50,
    ) -> list[AuditLog]:

        return self.history(
            resource_type="feature_flag",
            resource_id=feature_flag_id,
            page=page,
            page_size=page_size,
        )

    # ================================================================
    # CHANGE DIFF
    # ================================================================

    @staticmethod
    def calculate_diff(
        before: dict[str, Any] | None,
        after: dict[str, Any] | None,
    ) -> dict[str, Any]:
        """
        Calculates field-level changes.

        Example:

        {
            "is_active": {
                "before": False,
                "after": True
            }
        }
        """

        before = before or {}
        after = after or {}

        keys = set(before) | set(after)

        diff: dict[str, Any] = {}

        for key in sorted(keys):
            old_value = before.get(key)
            new_value = after.get(key)

            if old_value != new_value:
                diff[key] = {
                    "before": old_value,
                    "after": new_value,
                }

        return diff

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(
        obj: Any,
        *,
        exclude: set[str] | None = None,
    ) -> dict[str, Any]:
        """
        Convert a SQLAlchemy model into a serializable
        dictionary for audit snapshots.
        """

        exclude = exclude or set()

        result: dict[str, Any] = {}

        mapper = getattr(
            obj,
            "__mapper__",
            None,
        )

        if mapper is None:
            raise ValueError(
                "Object is not a SQLAlchemy model."
            )

        for column in mapper.columns:
            name = column.name

            if name in exclude:
                continue

            value = getattr(
                obj,
                name,
                None,
            )

            if isinstance(
                value,
                datetime,
            ):
                value = (
                    value.isoformat()
                )

            result[name] = value

        return result

    # ================================================================
    # SERIALIZATION
    # ================================================================

    @staticmethod
    def _serialize_json(
        value: dict[str, Any] | None,
    ) -> str | None:

        if value is None:
            return None

        return json.dumps(
            value,
            default=str,
            ensure_ascii=False,
            separators=(",", ":"),
        )

    # ================================================================
    # VALIDATION
    # ================================================================

    @staticmethod
    def _normalize_action(
        action: str,
    ) -> str:

        if not isinstance(action, str):
            raise ValueError(
                "Audit action must be a string."
            )

        value = action.strip().upper()

        if not value:
            raise ValueError(
                "Audit action cannot be empty."
            )

        if len(value) > 100:
            raise ValueError(
                "Audit action cannot exceed "
                "100 characters."
            )

        return value

    @staticmethod
    def _normalize_resource_type(
        resource_type: str,
    ) -> str:

        if not isinstance(
            resource_type,
            str,
        ):
            raise ValueError(
                "Resource type must be a string."
            )

        value = resource_type.strip().lower()

        if not value:
            raise ValueError(
                "Resource type cannot be empty."
            )

        if len(value) > 100:
            raise ValueError(
                "Resource type cannot exceed "
                "100 characters."
            )

        return value

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