from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.constants import ScheduleStatus
from app.core.database import get_db
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_schedule import FeatureSchedule
from app.models.user import User


router = APIRouter(
    prefix="/feature-schedules",
    tags=["Feature Schedules"],
)


# ================================================================
# SCHEMAS
# ================================================================


class FeatureScheduleCreateRequest(BaseModel):
    feature_flag_id: int = Field(gt=0)
    environment_id: int = Field(gt=0)
    start_time: datetime
    end_time: datetime | None = None
    status: str = ScheduleStatus.SCHEDULED.value


class FeatureScheduleUpdateRequest(BaseModel):
    start_time: datetime | None = None
    end_time: datetime | None = None
    status: str | None = None


class FeatureScheduleResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    start_time: datetime
    end_time: datetime | None
    status: str

    class Config:
        from_attributes = True


class FeatureScheduleListResponse(BaseModel):
    items: list[FeatureScheduleResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# VALIDATE SCHEDULE STATUS
# ================================================================


def validate_schedule_status(value: str) -> str:
    """
    Validate and normalize schedule status.

    Accepted values:
        - active
        - cancelled
        - completed
        - scheduled
    """

    value = value.strip().lower()

    valid_statuses = {
        item.value
        for item in ScheduleStatus
    }

    if value not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid schedule status '{value}'. "
                f"Allowed values: "
                f"{', '.join(sorted(valid_statuses))}"
            ),
        )

    return value


# ================================================================
# VALIDATE TIME RANGE
# ================================================================


def validate_time_range(
    start_time: datetime,
    end_time: datetime | None,
) -> None:

    if (
        end_time is not None
        and end_time <= start_time
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "end_time must be later "
                "than start_time."
            ),
        )


# ================================================================
# LIST SCHEDULES
# ================================================================


@router.get(
    "",
    response_model=FeatureScheduleListResponse,
    summary="List feature schedules",
)
def list_schedules(
    feature_flag_id: int | None = Query(
        default=None,
        gt=0,
    ),
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    status_filter: str | None = Query(
        default=None,
        alias="status",
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureScheduleListResponse:

    statement = (
        select(FeatureSchedule)
        .order_by(
            FeatureSchedule.start_time
        )
    )

    if feature_flag_id is not None:
        statement = statement.where(
            FeatureSchedule.feature_flag_id
            == feature_flag_id
        )

    if environment_id is not None:
        statement = statement.where(
            FeatureSchedule.environment_id
            == environment_id
        )

    if status_filter is not None:
        normalized_status = (
            validate_schedule_status(
                status_filter
            )
        )

        statement = statement.where(
            FeatureSchedule.status
            == normalized_status
        )

    schedules = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return FeatureScheduleListResponse(
        items=schedules,
        total=len(schedules),
    )


# ================================================================
# GET SCHEDULE
# ================================================================


@router.get(
    "/{schedule_id}",
    response_model=FeatureScheduleResponse,
    summary="Get feature schedule",
)
def get_schedule(
    schedule_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureSchedule:

    schedule = db.get(
        FeatureSchedule,
        schedule_id,
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature schedule {schedule_id} "
                "was not found."
            ),
        )

    return schedule


# ================================================================
# CREATE SCHEDULE
# ================================================================


@router.post(
    "",
    response_model=FeatureScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature schedule",
)
def create_schedule(
    payload: FeatureScheduleCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureSchedule:

    # ------------------------------------------------------------
    # Validate time range
    # ------------------------------------------------------------

    validate_time_range(
        payload.start_time,
        payload.end_time,
    )

    # ------------------------------------------------------------
    # Validate status
    # ------------------------------------------------------------

    normalized_status = (
        validate_schedule_status(
            payload.status
        )
    )

    # ------------------------------------------------------------
    # Validate feature flag
    # ------------------------------------------------------------

    feature_flag = db.get(
        FeatureFlag,
        payload.feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag "
                f"{payload.feature_flag_id} "
                "was not found."
            ),
        )

    # ------------------------------------------------------------
    # Validate environment
    # ------------------------------------------------------------

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

    # ------------------------------------------------------------
    # Create schedule
    # ------------------------------------------------------------

    schedule = FeatureSchedule(
        feature_flag_id=payload.feature_flag_id,
        environment_id=payload.environment_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status=normalized_status,
    )

    db.add(schedule)

    try:
        db.commit()
        db.refresh(schedule)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Schedule violates a database "
                "constraint."
            ),
        ) from exc

    return schedule


# ================================================================
# UPDATE SCHEDULE
# ================================================================


@router.put(
    "/{schedule_id}",
    response_model=FeatureScheduleResponse,
    summary="Update feature schedule",
)
def update_schedule(
    schedule_id: int,
    payload: FeatureScheduleUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureSchedule:

    schedule = db.get(
        FeatureSchedule,
        schedule_id,
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature schedule {schedule_id} "
                "was not found."
            ),
        )

    # ------------------------------------------------------------
    # Determine new values
    # ------------------------------------------------------------

    new_start_time = (
        payload.start_time
        if payload.start_time is not None
        else schedule.start_time
    )

    new_end_time = (
        payload.end_time
        if payload.end_time is not None
        else schedule.end_time
    )

    # ------------------------------------------------------------
    # Validate time range
    # ------------------------------------------------------------

    validate_time_range(
        new_start_time,
        new_end_time,
    )

    # ------------------------------------------------------------
    # Update time
    # ------------------------------------------------------------

    if payload.start_time is not None:
        schedule.start_time = (
            payload.start_time
        )

    if payload.end_time is not None:
        schedule.end_time = (
            payload.end_time
        )

    # ------------------------------------------------------------
    # Update status
    # ------------------------------------------------------------

    if payload.status is not None:
        schedule.status = (
            validate_schedule_status(
                payload.status
            )
        )

    try:
        db.commit()
        db.refresh(schedule)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Schedule update violates "
                "a database constraint."
            ),
        ) from exc

    return schedule


# ================================================================
# CANCEL SCHEDULE
# ================================================================


@router.post(
    "/{schedule_id}/cancel",
    response_model=FeatureScheduleResponse,
    summary="Cancel feature schedule",
)
def cancel_schedule(
    schedule_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureSchedule:

    schedule = db.get(
        FeatureSchedule,
        schedule_id,
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature schedule {schedule_id} "
                "was not found."
            ),
        )

    schedule.status = (
        ScheduleStatus.CANCELLED.value
    )

    db.commit()
    db.refresh(schedule)

    return schedule


# ================================================================
# ACTIVATE SCHEDULE
# ================================================================


@router.post(
    "/{schedule_id}/activate",
    response_model=FeatureScheduleResponse,
    summary="Activate feature schedule",
)
def activate_schedule(
    schedule_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureSchedule:

    schedule = db.get(
        FeatureSchedule,
        schedule_id,
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature schedule {schedule_id} "
                "was not found."
            ),
        )

    schedule.status = (
        ScheduleStatus.SCHEDULED.value
    )

    db.commit()
    db.refresh(schedule)

    return schedule


# ================================================================
# DELETE SCHEDULE
# ================================================================


@router.delete(
    "/{schedule_id}",
    response_model=MessageResponse,
    summary="Delete feature schedule",
)
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> MessageResponse:

    schedule = db.get(
        FeatureSchedule,
        schedule_id,
    )

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature schedule {schedule_id} "
                "was not found."
            ),
        )

    db.delete(schedule)
    db.commit()

    return MessageResponse(
        message=(
            f"Feature schedule {schedule_id} "
            "deleted successfully."
        )
    )