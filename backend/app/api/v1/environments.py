from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.environment import Environment
from app.models.user import User


router = APIRouter(
    prefix="/environments",
    tags=["Environments"],
)


# ================================================================
# SCHEMAS
# ================================================================


class EnvironmentCreateRequest(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=50,
    )
    description: str | None = None
    is_active: bool = True


class EnvironmentUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    description: str | None = None
    is_active: bool | None = None


class EnvironmentResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool

    class Config:
        from_attributes = True


class EnvironmentListResponse(BaseModel):
    items: list[EnvironmentResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST ENVIRONMENTS
# ================================================================


@router.get(
    "",
    response_model=EnvironmentListResponse,
    summary="List environments",
)
def list_environments(
    is_active: bool | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> EnvironmentListResponse:

    statement = (
        select(Environment)
        .order_by(Environment.id)
    )

    if is_active is not None:
        statement = statement.where(
            Environment.is_active == is_active
        )

    environments = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return EnvironmentListResponse(
        items=environments,
        total=len(environments),
    )


# ================================================================
# GET ENVIRONMENT
# ================================================================


@router.get(
    "/{environment_id}",
    response_model=EnvironmentResponse,
    summary="Get environment by ID",
)
def get_environment(
    environment_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> Environment:

    environment = db.get(
        Environment,
        environment_id,
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Environment {environment_id} "
                "was not found."
            ),
        )

    return environment


# ================================================================
# CREATE ENVIRONMENT
# ================================================================


@router.post(
    "",
    response_model=EnvironmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create environment",
)
def create_environment(
    payload: EnvironmentCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Environment:

    name = payload.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Environment name cannot be empty."
            ),
        )

    existing = db.execute(
        select(Environment)
        .where(
            Environment.name == name
        )
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Environment '{name}' "
                "already exists."
            ),
        )

    environment = Environment(
        name=name,
        description=payload.description,
        is_active=payload.is_active,
    )

    db.add(environment)

    try:
        db.commit()
        db.refresh(environment)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Environment name already exists."
            ),
        ) from exc

    return environment


# ================================================================
# UPDATE ENVIRONMENT
# ================================================================


@router.put(
    "/{environment_id}",
    response_model=EnvironmentResponse,
    summary="Update environment",
)
def update_environment(
    environment_id: int,
    payload: EnvironmentUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Environment:

    environment = db.get(
        Environment,
        environment_id,
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Environment {environment_id} "
                "was not found."
            ),
        )

    if payload.name is not None:
        name = payload.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Environment name "
                    "cannot be empty."
                ),
            )

        existing = db.execute(
            select(Environment)
            .where(
                Environment.name == name,
                Environment.id != environment_id,
            )
            .limit(1)
        ).scalar_one_or_none()

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Environment '{name}' "
                    "already exists."
                ),
            )

        environment.name = name

    if payload.description is not None:
        environment.description = (
            payload.description
        )

    if payload.is_active is not None:
        environment.is_active = (
            payload.is_active
        )

    try:
        db.commit()
        db.refresh(environment)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Environment update violates "
                "a database constraint."
            ),
        ) from exc

    return environment


# ================================================================
# ACTIVATE ENVIRONMENT
# ================================================================


@router.post(
    "/{environment_id}/activate",
    response_model=EnvironmentResponse,
    summary="Activate environment",
)
def activate_environment(
    environment_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Environment:

    environment = db.get(
        Environment,
        environment_id,
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Environment {environment_id} "
                "was not found."
            ),
        )

    environment.is_active = True

    db.commit()
    db.refresh(environment)

    return environment


# ================================================================
# DEACTIVATE ENVIRONMENT
# ================================================================


@router.post(
    "/{environment_id}/deactivate",
    response_model=EnvironmentResponse,
    summary="Deactivate environment",
)
def deactivate_environment(
    environment_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Environment:

    environment = db.get(
        Environment,
        environment_id,
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Environment {environment_id} "
                "was not found."
            ),
        )

    environment.is_active = False

    db.commit()
    db.refresh(environment)

    return environment


# ================================================================
# DELETE ENVIRONMENT
# ================================================================


@router.delete(
    "/{environment_id}",
    response_model=MessageResponse,
    summary="Delete environment",
)
def delete_environment(
    environment_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    environment = db.get(
        Environment,
        environment_id,
    )

    if environment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Environment {environment_id} "
                "was not found."
            ),
        )

    db.delete(environment)
    db.commit()

    return {
        "message": (
            f"Environment {environment_id} "
            "deleted successfully."
        )
    }