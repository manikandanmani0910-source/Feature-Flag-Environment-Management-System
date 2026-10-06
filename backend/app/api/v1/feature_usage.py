from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_usage import FeatureUsage
from app.models.user import User


router = APIRouter(
    prefix="/feature-usage",
    tags=["Feature Usage"],
)


# ================================================================
# SCHEMAS
# ================================================================


class FeatureUsageCreateRequest(BaseModel):
    feature_flag_id: int = Field(gt=0)
    environment_id: int = Field(gt=0)
    usage_date: date
    evaluation_count: int = Field(default=0, ge=0)
    enabled_count: int = Field(default=0, ge=0)
    disabled_count: int = Field(default=0, ge=0)
    unique_user_count: int = Field(default=0, ge=0)


class FeatureUsageUpdateRequest(BaseModel):
    evaluation_count: int | None = Field(
        default=None,
        ge=0,
    )
    enabled_count: int | None = Field(
        default=None,
        ge=0,
    )
    disabled_count: int | None = Field(
        default=None,
        ge=0,
    )
    unique_user_count: int | None = Field(
        default=None,
        ge=0,
    )


class FeatureUsageResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    usage_date: date
    evaluation_count: int
    enabled_count: int
    disabled_count: int
    unique_user_count: int

    class Config:
        from_attributes = True


class FeatureUsageListResponse(BaseModel):
    items: list[FeatureUsageResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST USAGE
# ================================================================


@router.get(
    "",
    response_model=FeatureUsageListResponse,
    summary="List feature usage records",
)
def list_usage(
    feature_flag_id: int | None = Query(
        default=None,
        gt=0,
    ),
    environment_id: int | None = Query(
        default=None,
        gt=0,
    ),
    usage_date: date | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureUsageListResponse:

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
        select(FeatureUsage)
        .order_by(
            FeatureUsage.usage_date.desc()
        )
    )

    if feature_flag_id is not None:
        statement = statement.where(
            FeatureUsage.feature_flag_id
            == feature_flag_id
        )

    if environment_id is not None:
        statement = statement.where(
            FeatureUsage.environment_id
            == environment_id
        )

    if usage_date is not None:
        statement = statement.where(
            FeatureUsage.usage_date
            == usage_date
        )

    if start_date is not None:
        statement = statement.where(
            FeatureUsage.usage_date
            >= start_date
        )

    if end_date is not None:
        statement = statement.where(
            FeatureUsage.usage_date
            <= end_date
        )

    records = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return FeatureUsageListResponse(
        items=records,
        total=len(records),
    )


# ================================================================
# GET USAGE RECORD
# ================================================================


@router.get(
    "/{usage_id}",
    response_model=FeatureUsageResponse,
    summary="Get feature usage record",
)
def get_usage(
    usage_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureUsage:

    usage = db.get(
        FeatureUsage,
        usage_id,
    )

    if usage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature usage record "
                f"{usage_id} was not found."
            ),
        )

    return usage


# ================================================================
# CREATE USAGE RECORD
# ================================================================


@router.post(
    "",
    response_model=FeatureUsageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature usage record",
)
def create_usage(
    payload: FeatureUsageCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureUsage:

    # Validate feature flag
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

    # Validate environment
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

    # Check daily uniqueness
    existing = db.execute(
        select(FeatureUsage)
        .where(
            FeatureUsage.feature_flag_id
            == payload.feature_flag_id,
            FeatureUsage.environment_id
            == payload.environment_id,
            FeatureUsage.usage_date
            == payload.usage_date,
        )
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Usage record already exists "
                "for this feature, environment, "
                "and date."
            ),
        )

    # Basic consistency validation
    if (
        payload.enabled_count
        + payload.disabled_count
        > payload.evaluation_count
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "enabled_count + disabled_count "
                "cannot exceed evaluation_count."
            ),
        )

    usage = FeatureUsage(
        feature_flag_id=payload.feature_flag_id,
        environment_id=payload.environment_id,
        usage_date=payload.usage_date,
        evaluation_count=payload.evaluation_count,
        enabled_count=payload.enabled_count,
        disabled_count=payload.disabled_count,
        unique_user_count=payload.unique_user_count,
    )

    db.add(usage)

    try:
        db.commit()
        db.refresh(usage)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Usage record violates "
                "a database constraint."
            ),
        ) from exc

    return usage


# ================================================================
# UPDATE USAGE RECORD
# ================================================================


@router.put(
    "/{usage_id}",
    response_model=FeatureUsageResponse,
    summary="Update feature usage record",
)
def update_usage(
    usage_id: int,
    payload: FeatureUsageUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureUsage:

    usage = db.get(
        FeatureUsage,
        usage_id,
    )

    if usage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature usage record "
                f"{usage_id} was not found."
            ),
        )

    evaluation_count = (
        payload.evaluation_count
        if payload.evaluation_count is not None
        else usage.evaluation_count
    )

    enabled_count = (
        payload.enabled_count
        if payload.enabled_count is not None
        else usage.enabled_count
    )

    disabled_count = (
        payload.disabled_count
        if payload.disabled_count is not None
        else usage.disabled_count
    )

    if (
        enabled_count + disabled_count
        > evaluation_count
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "enabled_count + disabled_count "
                "cannot exceed evaluation_count."
            ),
        )

    if payload.evaluation_count is not None:
        usage.evaluation_count = (
            payload.evaluation_count
        )

    if payload.enabled_count is not None:
        usage.enabled_count = (
            payload.enabled_count
        )

    if payload.disabled_count is not None:
        usage.disabled_count = (
            payload.disabled_count
        )

    if payload.unique_user_count is not None:
        usage.unique_user_count = (
            payload.unique_user_count
        )

    db.commit()
    db.refresh(usage)

    return usage


# ================================================================
# INCREMENT USAGE
# ================================================================


@router.post(
    "/{usage_id}/increment",
    response_model=FeatureUsageResponse,
    summary="Increment usage counters",
)
def increment_usage(
    usage_id: int,
    evaluation_count: int = Query(
        default=1,
        ge=0,
    ),
    enabled_count: int = Query(
        default=0,
        ge=0,
    ),
    disabled_count: int = Query(
        default=0,
        ge=0,
    ),
    unique_user_count: int = Query(
        default=0,
        ge=0,
    ),
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureUsage:

    usage = db.get(
        FeatureUsage,
        usage_id,
    )

    if usage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature usage record "
                f"{usage_id} was not found."
            ),
        )

    if (
        enabled_count + disabled_count
        > evaluation_count
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "enabled_count + disabled_count "
                "cannot exceed evaluation_count."
            ),
        )

    usage.evaluation_count += (
        evaluation_count
    )

    usage.enabled_count += (
        enabled_count
    )

    usage.disabled_count += (
        disabled_count
    )

    usage.unique_user_count += (
        unique_user_count
    )

    db.commit()
    db.refresh(usage)

    return usage


# ================================================================
# DELETE USAGE RECORD
# ================================================================


@router.delete(
    "/{usage_id}",
    response_model=MessageResponse,
    summary="Delete feature usage record",
)
def delete_usage(
    usage_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    usage = db.get(
        FeatureUsage,
        usage_id,
    )

    if usage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature usage record "
                f"{usage_id} was not found."
            ),
        )

    db.delete(usage)
    db.commit()

    return {
        "message": (
            f"Feature usage record {usage_id} "
            "deleted successfully."
        )
    }