from datetime import datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        actor_id: int | None,
        environment_id: int | None,
        action: str,
        entity_type: str,
        entity_id: str,
        description: str | None = None,
        old_values: dict[str, Any] | None = None,
        new_values: dict[str, Any] | None = None,
        metadata_json: dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        audit_log = AuditLog(
            actor_id=actor_id,
            environment_id=environment_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            old_values=old_values,
            new_values=new_values,
            metadata_json=metadata_json,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.session.add(audit_log)
        self.session.flush()
        self.session.refresh(audit_log)

        return audit_log

    def get_by_id(
        self,
        audit_log_id: int,
    ) -> AuditLog | None:
        statement = select(AuditLog).where(
            AuditLog.id == audit_log_id
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_logs(
        self,
        *,
        page: int,
        page_size: int,
        actor_id: int | None = None,
        environment_id: int | None = None,
        action: str | None = None,
        entity_type: str | None = None,
        entity_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
    ) -> tuple[list[AuditLog], int]:
        filters = []

        if actor_id is not None:
            filters.append(
                AuditLog.actor_id == actor_id
            )

        if environment_id is not None:
            filters.append(
                AuditLog.environment_id
                == environment_id
            )

        if action is not None:
            filters.append(
                AuditLog.action == action
            )

        if entity_type is not None:
            filters.append(
                AuditLog.entity_type == entity_type
            )

        if entity_id is not None:
            filters.append(
                AuditLog.entity_id == entity_id
            )

        if start_date is not None:
            filters.append(
                AuditLog.created_at >= start_date
            )

        if end_date is not None:
            filters.append(
                AuditLog.created_at <= end_date
            )

        statement = (
            select(AuditLog)
            .where(*filters)
            .order_by(
                AuditLog.created_at.desc(),
                AuditLog.id.desc(),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_statement = (
            select(func.count(AuditLog.id))
            .where(*filters)
        )

        logs = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        return logs, total