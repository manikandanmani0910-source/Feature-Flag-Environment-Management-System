from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout
from app.models.user import User


router = APIRouter(
    prefix="/feature-rollouts",
    tags=["Feature Rollouts"],
)


# ================================================================
# SCHEMAS
# ================================================================


class FeatureRolloutCreateRequest(BaseModel):
    feature_flag_id: int = Field(gt=0)
    environment_id: int = Field(gt=0)

    is_enabled: bool = False

    rollout_percentage: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        le=100,
    )

    targeting_enabled: bool = False


class FeatureRolloutUpdateRequest(BaseModel):
    is_enabled: bool | None = None

    rollout_percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    targeting_enabled: bool | None = None


class FeatureRolloutPercentageRequest(BaseModel):
    percentage: Decimal = Field(
        ge=0,
        le=100,
    )


class FeatureRolloutResponse(BaseModel):
    id: int
    feature_flag_id: int
    environment_id: int
    is_enabled: bool
    rollout_percentage: Decimal
    targeting_enabled: bool
    version: int

    class Config:
        from_attributes = True


class FeatureRolloutListResponse(BaseModel):
    items: list[FeatureRolloutResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST ROLLOUTS
# ================================================================


@router.get(
    "",
    response_model=FeatureRolloutListResponse,
    summary="List feature rollouts",
)
def list_rollouts(
    feature_flag_id: int | None = None,
    environment_id: int | None = None,
    is_enabled: bool | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureRolloutListResponse:

    statement = (
        select(FeatureRollout)
        .order_by(
            FeatureRollout.id.desc()
        )
    )

    if feature_flag_id is not None:
        statement = statement.where(
            FeatureRollout.feature_flag_id
            == feature_flag_id
        )

    if environment_id is not None:
        statement = statement.where(
            FeatureRollout.environment_id
            == environment_id
        )

    if is_enabled is not None:
        statement = statement.where(
            FeatureRollout.is_enabled
            == is_enabled
        )

    rollouts = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return FeatureRolloutListResponse(
        items=rollouts,
        total=len(rollouts),
    )


# ================================================================
# GET ROLLOUT
# ================================================================


@router.get(
    "/{rollout_id}",
    response_model=FeatureRolloutResponse,
    summary="Get feature rollout",
)
def get_rollout(
    rollout_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    return rollout


# ================================================================
# CREATE ROLLOUT
# ================================================================


@router.post(
    "",
    response_model=FeatureRolloutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature rollout",
)
def create_rollout(
    payload: FeatureRolloutCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

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
    # Prevent duplicate rollout
    # ------------------------------------------------------------

    existing = db.execute(
        select(FeatureRollout)
        .where(
            FeatureRollout.feature_flag_id
            == payload.feature_flag_id,
            FeatureRollout.environment_id
            == payload.environment_id,
        )
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A rollout already exists for "
                "this feature flag and environment."
            ),
        )

    # ------------------------------------------------------------
    # Create rollout
    # ------------------------------------------------------------

    rollout = FeatureRollout(
        feature_flag_id=payload.feature_flag_id,
        environment_id=payload.environment_id,
        is_enabled=payload.is_enabled,
        rollout_percentage=(
            payload.rollout_percentage
        ),
        targeting_enabled=(
            payload.targeting_enabled
        ),
        version=1,
    )

    db.add(rollout)

    try:
        db.commit()
        db.refresh(rollout)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Rollout violates a database "
                "constraint."
            ),
        ) from exc

    return rollout


# ================================================================
# UPDATE ROLLOUT
# ================================================================


@router.put(
    "/{rollout_id}",
    response_model=FeatureRolloutResponse,
    summary="Update feature rollout",
)
def update_rollout(
    rollout_id: int,
    payload: FeatureRolloutUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    changed = False

    if payload.is_enabled is not None:
        rollout.is_enabled = (
            payload.is_enabled
        )
        changed = True

    if payload.rollout_percentage is not None:
        rollout.rollout_percentage = (
            payload.rollout_percentage
        )
        changed = True

    if payload.targeting_enabled is not None:
        rollout.targeting_enabled = (
            payload.targeting_enabled
        )
        changed = True

    # Increment version whenever configuration changes.
    if changed:
        rollout.version += 1

    try:
        db.commit()
        db.refresh(rollout)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Rollout update violates "
                "a database constraint."
            ),
        ) from exc

    return rollout


# ================================================================
# ENABLE ROLLOUT
# ================================================================


@router.post(
    "/{rollout_id}/enable",
    response_model=FeatureRolloutResponse,
    summary="Enable feature rollout",
)
def enable_rollout(
    rollout_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    rollout.is_enabled = True
    rollout.version += 1

    db.commit()
    db.refresh(rollout)

    return rollout


# ================================================================
# DISABLE ROLLOUT
# ================================================================


@router.post(
    "/{rollout_id}/disable",
    response_model=FeatureRolloutResponse,
    summary="Disable feature rollout",
)
def disable_rollout(
    rollout_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    rollout.is_enabled = False
    rollout.version += 1

    db.commit()
    db.refresh(rollout)

    return rollout


# ================================================================
# UPDATE ROLLOUT PERCENTAGE
# ================================================================


@router.patch(
    "/{rollout_id}/percentage",
    response_model=FeatureRolloutResponse,
    summary="Update rollout percentage",
)
def update_rollout_percentage(
    rollout_id: int,
    payload: FeatureRolloutPercentageRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureRollout:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    rollout.rollout_percentage = (
        payload.percentage
    )

    rollout.version += 1

    try:
        db.commit()
        db.refresh(rollout)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Rollout percentage update "
                "violates a database constraint."
            ),
        ) from exc

    return rollout


# ================================================================
# DELETE ROLLOUT
# ================================================================


@router.delete(
    "/{rollout_id}",
    response_model=MessageResponse,
    summary="Delete feature rollout",
)
def delete_rollout(
    rollout_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    rollout = db.get(
        FeatureRollout,
        rollout_id,
    )

    if rollout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature rollout {rollout_id} "
                "was not found."
            ),
        )

    db.delete(rollout)
    db.commit()

    return {
        "message": (
            f"Feature rollout {rollout_id} "
            "deleted successfully."
        )
    }