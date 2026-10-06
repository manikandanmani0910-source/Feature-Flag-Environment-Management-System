from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.feature_flag import FeatureFlag
from app.models.user import User


router = APIRouter(
    prefix="/feature-flags",
    tags=["Feature Flags"],
)


# ================================================================
# SCHEMAS
# ================================================================


class FeatureFlagCreateRequest(BaseModel):
    key: str = Field(
        min_length=1,
        max_length=150,
    )
    name: str = Field(
        min_length=1,
        max_length=150,
    )
    description: str | None = None
    is_active: bool = True


class FeatureFlagUpdateRequest(BaseModel):
    key: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    description: str | None = None
    is_active: bool | None = None


class FeatureFlagResponse(BaseModel):
    id: int
    key: str
    name: str
    description: str | None
    is_active: bool

    class Config:
        from_attributes = True


class FeatureFlagListResponse(BaseModel):
    items: list[FeatureFlagResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST FEATURE FLAGS
# ================================================================


@router.get(
    "",
    response_model=FeatureFlagListResponse,
    summary="List feature flags",
)
def list_feature_flags(
    is_active: bool | None = None,
    search: str | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureFlagListResponse:

    statement = (
        select(FeatureFlag)
        .order_by(FeatureFlag.id.desc())
    )

    if is_active is not None:
        statement = statement.where(
            FeatureFlag.is_active == is_active
        )

    if search:
        search_value = search.strip()

        if search_value:
            pattern = f"%{search_value}%"

            statement = statement.where(
                (
                    FeatureFlag.key.ilike(pattern)
                    | FeatureFlag.name.ilike(pattern)
                    | FeatureFlag.description.ilike(pattern)
                )
            )

    flags = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return FeatureFlagListResponse(
        items=flags,
        total=len(flags),
    )


# ================================================================
# GET FEATURE FLAG
# ================================================================


@router.get(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
    summary="Get feature flag",
)
def get_feature_flag(
    feature_flag_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    feature_flag = db.get(
        FeatureFlag,
        feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag {feature_flag_id} "
                "was not found."
            ),
        )

    return feature_flag


# ================================================================
# GET FEATURE FLAG BY KEY
# ================================================================


@router.get(
    "/key/{key}",
    response_model=FeatureFlagResponse,
    summary="Get feature flag by key",
)
def get_feature_flag_by_key(
    key: str,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    feature_flag = db.execute(
        select(FeatureFlag)
        .where(FeatureFlag.key == key)
        .limit(1)
    ).scalar_one_or_none()

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag with key "
                f"'{key}' was not found."
            ),
        )

    return feature_flag


# ================================================================
# CREATE FEATURE FLAG
# ================================================================


@router.post(
    "",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create feature flag",
)
def create_feature_flag(
    payload: FeatureFlagCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    key = payload.key.strip()
    name = payload.name.strip()

    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feature flag key cannot be empty.",
        )

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feature flag name cannot be empty.",
        )

    existing = db.execute(
        select(FeatureFlag)
        .where(FeatureFlag.key == key)
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Feature flag key '{key}' "
                "already exists."
            ),
        )

    feature_flag = FeatureFlag(
        key=key,
        name=name,
        description=payload.description,
        is_active=payload.is_active,
    )

    db.add(feature_flag)

    try:
        db.commit()
        db.refresh(feature_flag)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Feature flag key already exists."
            ),
        ) from exc

    return feature_flag


# ================================================================
# UPDATE FEATURE FLAG
# ================================================================


@router.put(
    "/{feature_flag_id}",
    response_model=FeatureFlagResponse,
    summary="Update feature flag",
)
def update_feature_flag(
    feature_flag_id: int,
    payload: FeatureFlagUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    feature_flag = db.get(
        FeatureFlag,
        feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag {feature_flag_id} "
                "was not found."
            ),
        )

    if payload.key is not None:
        key = payload.key.strip()

        if not key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Feature flag key "
                    "cannot be empty."
                ),
            )

        existing = db.execute(
            select(FeatureFlag)
            .where(
                FeatureFlag.key == key,
                FeatureFlag.id != feature_flag_id,
            )
            .limit(1)
        ).scalar_one_or_none()

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Feature flag key '{key}' "
                    "already exists."
                ),
            )

        feature_flag.key = key

    if payload.name is not None:
        name = payload.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Feature flag name "
                    "cannot be empty."
                ),
            )

        feature_flag.name = name

    if payload.description is not None:
        feature_flag.description = (
            payload.description
        )

    if payload.is_active is not None:
        feature_flag.is_active = (
            payload.is_active
        )

    try:
        db.commit()
        db.refresh(feature_flag)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Feature flag update violates "
                "a database constraint."
            ),
        ) from exc

    return feature_flag


# ================================================================
# ACTIVATE FEATURE FLAG
# ================================================================


@router.post(
    "/{feature_flag_id}/activate",
    response_model=FeatureFlagResponse,
    summary="Activate feature flag",
)
def activate_feature_flag(
    feature_flag_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    feature_flag = db.get(
        FeatureFlag,
        feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag {feature_flag_id} "
                "was not found."
            ),
        )

    feature_flag.is_active = True

    db.commit()
    db.refresh(feature_flag)

    return feature_flag


# ================================================================
# DEACTIVATE FEATURE FLAG
# ================================================================


@router.post(
    "/{feature_flag_id}/deactivate",
    response_model=FeatureFlagResponse,
    summary="Deactivate feature flag",
)
def deactivate_feature_flag(
    feature_flag_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> FeatureFlag:

    feature_flag = db.get(
        FeatureFlag,
        feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag {feature_flag_id} "
                "was not found."
            ),
        )

    feature_flag.is_active = False

    db.commit()
    db.refresh(feature_flag)

    return feature_flag


# ================================================================
# DELETE FEATURE FLAG
# ================================================================


@router.delete(
    "/{feature_flag_id}",
    response_model=MessageResponse,
    summary="Delete feature flag",
)
def delete_feature_flag(
    feature_flag_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    feature_flag = db.get(
        FeatureFlag,
        feature_flag_id,
    )

    if feature_flag is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Feature flag {feature_flag_id} "
                "was not found."
            ),
        )

    db.delete(feature_flag)
    db.commit()

    return {
        "message": (
            f"Feature flag {feature_flag_id} "
            "deleted successfully."
        )
    }