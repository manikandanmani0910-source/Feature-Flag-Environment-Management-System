from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# ================================================================
# PASSWORD HASHING
# ================================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its stored hash.
    """

    if not plain_password:
        return False

    if not hashed_password:
        return False

    try:
        return pwd_context.verify(
            plain_password,
            hashed_password,
        )
    except Exception:
        return False


def get_password_hash(
    password: str,
) -> str:
    """
    Generate a secure bcrypt password hash.
    """

    if not password:
        raise ValueError(
            "Password cannot be empty."
        )

    return pwd_context.hash(
        password
    )


# ================================================================
# JWT CREATION
# ================================================================

def create_access_token(
    *,
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a signed JWT access token.

    Standard claims:
    - sub
    - iat
    - exp
    """

    payload = dict(data)

    now = datetime.now(
        timezone.utc
    )

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=(
                settings
                .jwt_access_token_expire_minutes
            )
        )

    expire = now + expires_delta

    payload.update(
        {
            "iat": now,
            "exp": expire,
        }
    )

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


# ================================================================
# JWT DECODING
# ================================================================

def decode_access_token(
    token: str,
) -> dict[str, Any] | None:
    """
    Decode and validate a JWT.

    Returns None for invalid or expired tokens.
    """

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[
                settings.jwt_algorithm
            ],
        )

        subject = payload.get(
            "sub"
        )

        if subject is None:
            return None

        return payload

    except JWTError:
        return None


# ================================================================
# JWT VALIDATION
# ================================================================

def validate_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Strict JWT validation.

    Raises ValueError when the token is invalid.
    """

    payload = decode_access_token(
        token
    )

    if payload is None:
        raise ValueError(
            "Invalid or expired access token."
        )

    subject = payload.get(
        "sub"
    )

    if subject is None:
        raise ValueError(
            "Access token does not contain "
            "a valid subject."
        )

    return payload


# ================================================================
# TOKEN SUBJECT
# ================================================================

def get_token_subject(
    token: str,
) -> int:
    """
    Extract authenticated user ID from JWT.
    """

    payload = validate_access_token(
        token
    )

    subject = payload.get(
        "sub"
    )

    try:
        return int(subject)
    except (
        TypeError,
        ValueError,
    ) as exc:
        raise ValueError(
            "Invalid user identifier in token."
        ) from exc


# ================================================================
# TOKEN EXPIRATION
# ================================================================

def get_access_token_expiration() -> datetime:
    """
    Return the configured access-token expiration time.
    """

    return (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            minutes=(
                settings
                .jwt_access_token_expire_minutes
            )
        )
    )


# ================================================================
# TOKEN TTL
# ================================================================

def get_access_token_ttl() -> int:
    """
    Return access-token lifetime in seconds.
    """

    return (
        settings
        .jwt_access_token_expire_minutes
        * 60
    )