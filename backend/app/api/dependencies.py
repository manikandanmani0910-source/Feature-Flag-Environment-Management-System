from __future__ import annotations

from collections.abc import Generator
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.core.database import get_db
from app.models.role import Role
from app.models.user import User


# ================================================================
# AUTHENTICATION
# ================================================================

bearer_scheme = HTTPBearer(
    auto_error=False,
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the authenticated user from the JWT access token.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    payload = decode_access_token(
        credentials.credentials
    )

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    subject = payload.get("sub")

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token subject.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        ) from exc

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    return user


# ================================================================
# ADMIN AUTHORIZATION
# ================================================================

def require_admin(
    current_user: User = Depends(
        get_current_user
    ),
) -> User:
    """
    Require administrator privileges.
    """

    role = getattr(
        current_user,
        "role",
        None,
    )

    role_name = (
        getattr(
            role,
            "name",
            None,
        )
        if role is not None
        else None
    )

    # Supports both relationship-based role
    # and role_id based authorization.
    if role_name:
        is_admin = (
            role_name.lower()
            == "admin"
        )
    else:
        is_admin = False

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges are required.",
        )

    return current_user


# ================================================================
# ROLE-BASED AUTHORIZATION
# ================================================================

def require_roles(
    *allowed_roles: str,
) -> Callable:
    """
    Create a reusable role dependency.

    Example:

        Depends(
            require_roles(
                "admin",
                "manager",
            )
        )
    """

    normalized_roles = {
        role.strip().lower()
        for role in allowed_roles
        if role and role.strip()
    }

    if not normalized_roles:
        raise ValueError(
            "At least one role must be provided."
        )

    def role_dependency(
        current_user: User = Depends(
            get_current_user
        ),
    ) -> User:

        role = getattr(
            current_user,
            "role",
            None,
        )

        role_name = (
            getattr(
                role,
                "name",
                None,
            )
            if role is not None
            else None
        )

        if (
            role_name is None
            or role_name.lower()
            not in normalized_roles
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Insufficient permissions "
                    "for this operation."
                ),
            )

        return current_user

    return role_dependency


# ================================================================
# COMMON ROLE DEPENDENCIES
# ================================================================

require_admin_or_manager = require_roles(
    "admin",
    "manager",
)

require_admin_or_developer = require_roles(
    "admin",
    "developer",
)

require_any_authenticated_user = get_current_user


# ================================================================
# OPTIONAL AUTHENTICATION
# ================================================================

def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Resolve the current user when authentication is supplied.

    Unlike get_current_user(), this does not reject anonymous
    requests.
    """

    if credentials is None:
        return None

    if credentials.scheme.lower() != "bearer":
        return None

    payload = decode_access_token(
        credentials.credentials
    )

    if payload is None:
        return None

    subject = payload.get(
        "sub"
    )

    if subject is None:
        return None

    try:
        user_id = int(subject)
    except (
        TypeError,
        ValueError,
    ):
        return None

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    return user