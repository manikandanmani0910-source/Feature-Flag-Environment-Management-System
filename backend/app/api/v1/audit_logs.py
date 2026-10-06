from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.audit_log import AuditLog
from app.models.environment import Environment
from app.models.user import User


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
)


# ================================================================
# SCHEMAS
# ================================================================


class AuditLogCreateRequest(BaseModel):
    actor_id: int | None = None
    environment_id: int | None = None
    action: str = Field(
        min_length=1,
        max_length=50,
    )
    entity_type: str = Field(
        min_length=1,
        max_length=100,
    )
    entity_id: str = Field(
        min_length=1,
        max_length=100,
    )
    description: str | None = None
    old_values: dict[str, Any] | None = None
    new_values: dict[str, Any] | None = None
    metadata_json: dict[str, Any] | None = None
    ip_address: str | None = Field(
        default=None,
        max_length=45,
    )
    user_agent: str | None = Field(
        default=None,
        max_length=500,
    )


class AuditLogResponse(BaseModel):
    id: int
    actor_id: int | None
    environment_id: int | None
    action: str
    entity_type: str
    entity_id: str
    description: str | None
    old_values: dict[str, Any] | None
    new_values: dict[str, Any] | None
    metadata_json: dict[str, Any] | None
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int


# ================================================================
# LIST AUDIT LOGS
# ================================================================


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="List audit logs",
)
def list_audit_logs(
    actor_id: int | None = Query(
        default=None,
        gt=0,
    ),
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    action: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:

    if (
        start_date is not None
        and end_date is not None
        and end_date < start_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_date must be greater than "
                "or equal to start_date."
            ),
        )

    statement = (
        select(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
    )

    if actor_id is not None:
        statement = statement.where(
            AuditLog.actor_id == actor_id
        )

    if environment_id is not None:
        statement = statement.where(
            AuditLog.environment_id
            == environment_id
        )

    if action:
        statement = statement.where(
            AuditLog.action == action.strip()
        )

    if entity_type:
        statement = statement.where(
            AuditLog.entity_type
            == entity_type.strip()
        )

    if entity_id:
        statement = statement.where(
            AuditLog.entity_id
            == entity_id.strip()
        )

    if start_date is not None:
        statement = statement.where(
            AuditLog.created_at >= start_date
        )

    if end_date is not None:
        statement = statement.where(
            AuditLog.created_at <= end_date
        )

    logs = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return AuditLogListResponse(
        items=logs,
        total=len(logs),
    )


# ================================================================
# GET AUDIT LOG
# ================================================================


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
    summary="Get audit log",
)
def get_audit_log(
    audit_log_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> AuditLog:

    audit_log = db.get(
        AuditLog,
        audit_log_id,
    )

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Audit log {audit_log_id} "
                "was not found."
            ),
        )

    return audit_log


# ================================================================
# CREATE AUDIT LOG
# ================================================================


@router.post(
    "",
    response_model=AuditLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create audit log",
)
def create_audit_log(
    payload: AuditLogCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> AuditLog:

    # ------------------------------------------------------------
    # Validate actor
    # ------------------------------------------------------------

    if payload.actor_id is not None:
        actor = db.get(
            User,
            payload.actor_id,
        )

        if actor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Actor {payload.actor_id} "
                    "was not found."
                ),
            )

    # ------------------------------------------------------------
    # Validate environment
    # ------------------------------------------------------------

    if payload.environment_id is not None:
        environment = db.get(
            Environment,
            payload.environment_id,
        )

        if environment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Environment "
                    f"{payload.environment_id} "
                    "was not found."
                ),
            )

    audit_log = AuditLog(
        actor_id=payload.actor_id,
        environment_id=payload.environment_id,
        action=payload.action.strip(),
        entity_type=payload.entity_type.strip(),
        entity_id=payload.entity_id.strip(),
        description=payload.description,
        old_values=payload.old_values,
        new_values=payload.new_values,
        metadata_json=payload.metadata_json,
        ip_address=payload.ip_address,
        user_agent=payload.user_agent,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


# ================================================================
# DELETE AUDIT LOG
# ================================================================


@router.delete(
    "/{audit_log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete audit log",
)
def delete_audit_log(
    audit_log_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> None:

    audit_log = db.get(
        AuditLog,
        audit_log_id,
    )

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Audit log {audit_log_id} "
                "was not found."
            ),
        )

    db.delete(audit_log)
    db.commit()

    return None