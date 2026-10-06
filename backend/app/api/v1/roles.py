from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.role import Role
from app.models.user import User


router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
)


# ================================================================
# SCHEMAS
# ================================================================


class RoleCreateRequest(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=50,
    )
    description: str | None = None
    is_active: bool = True


class RoleUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    description: str | None = None
    is_active: bool | None = None


class RoleResponse(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool

    class Config:
        from_attributes = True


class RoleListResponse(BaseModel):
    items: list[RoleResponse]
    total: int


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST ROLES
# ================================================================


@router.get(
    "",
    response_model=RoleListResponse,
    summary="List all roles",
)
def list_roles(
    is_active: bool | None = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> RoleListResponse:

    statement = (
        select(Role)
        .order_by(Role.id)
    )

    if is_active is not None:
        statement = statement.where(
            Role.is_active == is_active
        )

    roles = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return RoleListResponse(
        items=roles,
        total=len(roles),
    )


# ================================================================
# GET ROLE
# ================================================================


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Get role by ID",
)
def get_role(
    role_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> Role:

    role = db.get(
        Role,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Role {role_id} was not found."
            ),
        )

    return role


# ================================================================
# CREATE ROLE
# ================================================================


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create role",
)
def create_role(
    payload: RoleCreateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Role:

    name = payload.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name cannot be empty.",
        )

    # Check duplicate role name
    existing = db.execute(
        select(Role)
        .where(Role.name == name)
        .limit(1)
    ).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Role '{name}' already exists."
            ),
        )

    role = Role(
        name=name,
        description=payload.description,
        is_active=payload.is_active,
    )

    db.add(role)

    try:
        db.commit()
        db.refresh(role)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Role name already exists.",
        ) from exc

    return role


# ================================================================
# UPDATE ROLE
# ================================================================


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Update role",
)
def update_role(
    role_id: int,
    payload: RoleUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Role:

    role = db.get(
        Role,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Role {role_id} was not found."
            ),
        )

    if payload.name is not None:
        name = payload.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Role name cannot be empty."
                ),
            )

        existing = db.execute(
            select(Role)
            .where(
                Role.name == name,
                Role.id != role_id,
            )
            .limit(1)
        ).scalar_one_or_none()

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Role '{name}' already exists."
                ),
            )

        role.name = name

    if payload.description is not None:
        role.description = (
            payload.description
        )

    if payload.is_active is not None:
        role.is_active = (
            payload.is_active
        )

    try:
        db.commit()
        db.refresh(role)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Role update violates a database constraint.",
        ) from exc

    return role


# ================================================================
# ACTIVATE ROLE
# ================================================================


@router.post(
    "/{role_id}/activate",
    response_model=RoleResponse,
    summary="Activate role",
)
def activate_role(
    role_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Role:

    role = db.get(
        Role,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Role {role_id} was not found."
            ),
        )

    role.is_active = True

    db.commit()
    db.refresh(role)

    return role


# ================================================================
# DEACTIVATE ROLE
# ================================================================


@router.post(
    "/{role_id}/deactivate",
    response_model=RoleResponse,
    summary="Deactivate role",
)
def deactivate_role(
    role_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> Role:

    role = db.get(
        Role,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Role {role_id} was not found."
            ),
        )

    # Don't deactivate a role that is
    # currently assigned to users.
    users_count = db.execute(
        select(User.id)
        .where(User.role_id == role_id)
        .limit(1)
    ).scalar_one_or_none()

    if users_count is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot deactivate a role that "
                "is currently assigned to users."
            ),
        )

    role.is_active = False

    db.commit()
    db.refresh(role)

    return role


# ================================================================
# DELETE ROLE
# ================================================================


@router.delete(
    "/{role_id}",
    response_model=MessageResponse,
    summary="Delete role",
)
def delete_role(
    role_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> dict[str, str]:

    role = db.get(
        Role,
        role_id,
    )

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Role {role_id} was not found."
            ),
        )

    # Because users.role_id is a required
    # foreign key, don't delete an assigned role.
    users_count = db.execute(
        select(User.id)
        .where(User.role_id == role_id)
        .limit(1)
    ).scalar_one_or_none()

    if users_count is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Cannot delete a role that "
                "is assigned to users."
            ),
        )

    db.delete(role)
    db.commit()

    return {
        "message": (
            f"Role {role_id} deleted successfully."
        )
    }