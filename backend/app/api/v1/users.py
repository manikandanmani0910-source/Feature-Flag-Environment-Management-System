from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.models.role import Role
from app.models.user import User


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ================================================================
# SCHEMAS
# ================================================================


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    is_superuser: bool
    role_id: int

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int


class UserUpdateRequest(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )
    email: EmailStr | None = None
    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    role_id: int | None = Field(
        default=None,
        gt=0,
    )


class MessageResponse(BaseModel):
    message: str


# ================================================================
# LIST USERS
# ================================================================


@router.get(
    "",
    response_model=UserListResponse,
    summary="List users",
)
def list_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserListResponse:

    statement = (
        select(User)
        .order_by(User.id.desc())
    )

    users = list(
        db.execute(statement)
        .scalars()
        .all()
    )

    return UserListResponse(
        items=users,
        total=len(users),
    )


# ================================================================
# GET USER
# ================================================================


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
)
def get_user(
    user_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
) -> User:

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {user_id} "
                "was not found."
            ),
        )

    return user


# ================================================================
# UPDATE USER
# ================================================================


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user",
)
def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> User:

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {user_id} "
                "was not found."
            ),
        )

    # ------------------------------------------------------------
    # Username uniqueness
    # ------------------------------------------------------------

    if payload.username is not None:
        username = payload.username.strip()

        existing_username = db.execute(
            select(User)
            .where(
                User.username == username,
                User.id != user_id,
            )
            .limit(1)
        ).scalar_one_or_none()

        if existing_username is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists.",
            )

        user.username = username

    # ------------------------------------------------------------
    # Email uniqueness
    # ------------------------------------------------------------

    if payload.email is not None:
        email = str(payload.email).strip().lower()

        existing_email = db.execute(
            select(User)
            .where(
                User.email == email,
                User.id != user_id,
            )
            .limit(1)
        ).scalar_one_or_none()

        if existing_email is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists.",
            )

        user.email = email

    # ------------------------------------------------------------
    # Name
    # ------------------------------------------------------------

    if payload.first_name is not None:
        user.first_name = (
            payload.first_name.strip()
        )

    if payload.last_name is not None:
        user.last_name = (
            payload.last_name.strip()
        )

    # ------------------------------------------------------------
    # Role
    # ------------------------------------------------------------

    if payload.role_id is not None:

        role = db.get(
            Role,
            payload.role_id,
        )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Role {payload.role_id} "
                    "was not found."
                ),
            )

        user.role_id = payload.role_id

    # ------------------------------------------------------------
    # Save
    # ------------------------------------------------------------

    try:
        db.commit()
        db.refresh(user)

    except IntegrityError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "User update violates a "
                "database constraint."
            ),
        ) from exc

    return user


# ================================================================
# ACTIVATE USER
# ================================================================


@router.patch(
    "/{user_id}/activate",
    response_model=UserResponse,
    summary="Activate user",
)
def activate_user(
    user_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> User:

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {user_id} "
                "was not found."
            ),
        )

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user


# ================================================================
# DEACTIVATE USER
# ================================================================


@router.patch(
    "/{user_id}/deactivate",
    response_model=UserResponse,
    summary="Deactivate user",
)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> User:

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {user_id} "
                "was not found."
            ),
        )

    # Prevent admin from accidentally
    # disabling their own account.
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot deactivate "
                "your own account."
            ),
        )

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


# ================================================================
# DELETE USER
# ================================================================


@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    summary="Delete user",
)
def delete_user(
    user_id: int,
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(get_db),
) -> MessageResponse:

    user = db.get(
        User,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"User {user_id} "
                "was not found."
            ),
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You cannot delete "
                "your own account."
            ),
        )

    db.delete(user)
    db.commit()

    return MessageResponse(
        message=(
            f"User {user_id} "
            "deleted successfully."
        )
    )