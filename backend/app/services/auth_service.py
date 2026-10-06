from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    verify_password,
)
from app.models.user import User


class AuthenticationError(Exception):
    """Base authentication exception."""


class InvalidCredentialsError(AuthenticationError):
    """Raised when authentication credentials are invalid."""


class InactiveUserError(AuthenticationError):
    """Raised when an inactive user attempts authentication."""


class UserNotFoundError(AuthenticationError):
    """Raised when the authenticated user cannot be found."""


class TokenGenerationError(AuthenticationError):
    """Raised when access-token generation fails."""


class AuthService:
    """
    Enterprise authentication service.

    Responsibilities:
    - Authenticate users
    - Verify password hashes
    - Reject inactive accounts
    - Generate JWT access tokens
    - Resolve authenticated users
    - Provide token metadata
    """

    def __init__(
        self,
        session: Session,
    ) -> None:
        self.session = session

    # ================================================================
    # AUTHENTICATE
    # ================================================================

    def authenticate(
        self,
        *,
        email: str,
        password: str,
    ) -> User:

        normalized_email = (
            self._normalize_email(email)
        )

        user = self._find_by_email(
            normalized_email
        )

        if user is None:
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise InactiveUserError(
                "User account is inactive."
            )

        password_hash = getattr(
            user,
            "password_hash",
            None,
        )

        if not password_hash:
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        if not verify_password(
            password,
            password_hash,
        ):
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        return user

    # ================================================================
    # LOGIN
    # ================================================================

    def login(
        self,
        *,
        email: str,
        password: str,
    ) -> dict[str, Any]:

        user = self.authenticate(
            email=email,
            password=password,
        )

        token = self._generate_access_token(
            user
        )

        expires_in = (
            settings.jwt_access_token_expire_minutes
            * 60
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": expires_in,
            "user": self._user_payload(
                user
            ),
        }

    # ================================================================
    # TOKEN
    # ================================================================

    def create_token(
        self,
        user: User,
    ) -> str:

        if not user.is_active:
            raise InactiveUserError(
                "Cannot generate a token "
                "for an inactive user."
            )

        return self._generate_access_token(
            user
        )

    # ================================================================
    # AUTHENTICATED USER
    # ================================================================

    def get_authenticated_user(
        self,
        user_id: int,
    ) -> User:

        statement = (
            select(User)
            .where(
                User.id == user_id
            )
            .limit(1)
        )

        user = self.session.execute(
            statement
        ).scalar_one_or_none()

        if user is None:
            raise UserNotFoundError(
                f"User {user_id} was not found."
            )

        if not user.is_active:
            raise InactiveUserError(
                "User account is inactive."
            )

        return user

    # ================================================================
    # TOKEN PAYLOAD
    # ================================================================

    def build_token_payload(
        self,
        user: User,
    ) -> dict[str, Any]:

        if not user.is_active:
            raise InactiveUserError(
                "Inactive users cannot receive "
                "authentication tokens."
            )

        payload: dict[str, Any] = {
            "sub": str(user.id),
            "email": user.email,
        }

        role_id = getattr(
            user,
            "role_id",
            None,
        )

        if role_id is not None:
            payload["role_id"] = role_id

        role = getattr(
            user,
            "role",
            None,
        )

        if role is not None:
            role_name = getattr(
                role,
                "name",
                None,
            )

            if role_name:
                payload["role"] = role_name

        return payload

    # ================================================================
    # TOKEN EXPIRATION
    # ================================================================

    @staticmethod
    def get_token_expiration() -> datetime:

        return (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=settings
                .jwt_access_token_expire_minutes
            )
        )

    # ================================================================
    # USER PAYLOAD
    # ================================================================

    @staticmethod
    def _user_payload(
        user: User,
    ) -> dict[str, Any]:

        role = getattr(
            user,
            "role",
            None,
        )

        return {
            "id": user.id,
            "email": user.email,
            "full_name": getattr(
                user,
                "full_name",
                None,
            ),
            "role_id": getattr(
                user,
                "role_id",
                None,
            ),
            "role": (
                getattr(
                    role,
                    "name",
                    None,
                )
                if role is not None
                else None
            ),
            "is_active": user.is_active,
        }

    # ================================================================
    # INTERNAL TOKEN GENERATION
    # ================================================================

    def _generate_access_token(
        self,
        user: User,
    ) -> str:

        try:
            payload = (
                self.build_token_payload(
                    user
                )
            )

            return create_access_token(
                data=payload
            )

        except Exception as exc:
            raise TokenGenerationError(
                "Unable to generate access token."
            ) from exc

    # ================================================================
    # USER LOOKUP
    # ================================================================

    def _find_by_email(
        self,
        email: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(
                User.email == email
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # VALIDATION
    # ================================================================

    @staticmethod
    def _normalize_email(
        email: str,
    ) -> str:

        if not isinstance(
            email,
            str,
        ):
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        value = (
            email.strip()
            .lower()
        )

        if not value or "@" not in value:
            raise InvalidCredentialsError(
                "Invalid email or password."
            )

        return value