from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.auth_service import (
    AuthService,
    AuthenticationError,
    InactiveUserError,
    InvalidCredentialsError,
)
from app.services.user_service import (
    UserAlreadyExistsError,
    UserService,
    UserValidationError,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ================================================================
# SCHEMAS
# ================================================================


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    full_name: str = Field(
        min_length=1,
        max_length=255,
    )
    role_id: int | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    role_id: int | None = None
    is_active: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict[str, Any]


class MessageResponse(BaseModel):
    message: str


# ================================================================
# REGISTER
# ================================================================


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> User:

    service = UserService(db)

    try:
        user = service.create(
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            role_id=payload.role_id,
        )

        return user

    except UserAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    except UserValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


# ================================================================
# LOGIN
# ================================================================


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and generate access token",
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    service = AuthService(db)

    try:
        return service.login(
            email=payload.email,
            password=payload.password,
        )

    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    except InactiveUserError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc),
        ) from exc

    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc


# ================================================================
# CURRENT USER
# ================================================================


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
) -> User:

    return current_user


# ================================================================
# LOGOUT
# ================================================================


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current user",
)
def logout(
    current_user: User = Depends(
        get_current_user
    ),
) -> dict[str, str]:

    # JWT access tokens are stateless.
    # The client removes the token after logout.

    return {
        "message": "Logout successful."
    }