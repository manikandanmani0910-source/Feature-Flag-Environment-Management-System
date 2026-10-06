from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User


class UserServiceError(Exception):
    """Base exception for user operations."""


class UserNotFoundError(UserServiceError):
    """Raised when a user does not exist."""


class UserAlreadyExistsError(UserServiceError):
    """Raised when a user already exists."""


class UserValidationError(UserServiceError):
    """Raised when user data is invalid."""


class UserService:
    """Enterprise user management service."""

    def __init__(self, session: Session) -> None:
        self.session = session

    # ================================================================
    # CREATE
    # ================================================================

    def create(
        self,
        *,
        email: str,
        password: str,
        full_name: str,
        role_id: int | None = None,
        is_active: bool = True,
    ) -> User:

        normalized_email = self._normalize_email(email)
        self._validate_password(password)

        normalized_name = self._normalize_name(full_name)

        parts = normalized_name.split(" ", 1)

        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        if not last_name:
            raise UserValidationError(
                "Full name must contain first name and last name."
            )

        # Username is derived from email because the current
        # registration API does not ask for username.
        username = normalized_email.split("@")[0]

        username = self._make_unique_username(username)

        existing = self._find_by_email(normalized_email)

        if existing is not None:
            raise UserAlreadyExistsError(
                f"User with email '{normalized_email}' already exists."
            )

        # role_id is required by the User model.
        if role_id is None:
            raise UserValidationError(
                "role_id is required when creating a user."
            )

        self._validate_role(role_id)

        user = User(
            username=username,
            email=normalized_email,
            password_hash=get_password_hash(password),
            first_name=first_name,
            last_name=last_name,
            role_id=role_id,
            is_active=is_active,
        )

        self.session.add(user)

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()
            raise UserAlreadyExistsError(
                "User creation violates a database constraint."
            ) from exc

        self.session.refresh(user)

        return user

    # ================================================================
    # GET
    # ================================================================

    def get(self, user_id: int) -> User:

        statement = (
            select(User)
            .where(User.id == user_id)
            .limit(1)
        )

        user = self.session.execute(
            statement
        ).scalar_one_or_none()

        if user is None:
            raise UserNotFoundError(
                f"User {user_id} was not found."
            )

        return user

    # ================================================================
    # GET BY EMAIL
    # ================================================================

    def get_by_email(self, email: str) -> User:

        normalized_email = self._normalize_email(email)

        user = self._find_by_email(normalized_email)

        if user is None:
            raise UserNotFoundError(
                f"User '{normalized_email}' was not found."
            )

        return user

    # ================================================================
    # LIST
    # ================================================================

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        is_active: bool | None = None,
        role_id: int | None = None,
        search: str | None = None,
    ) -> tuple[list[User], int]:

        if page < 1:
            raise UserValidationError(
                "page must be greater than zero."
            )

        if page_size < 1 or page_size > 100:
            raise UserValidationError(
                "page_size must be between 1 and 100."
            )

        conditions: list[Any] = []

        if is_active is not None:
            conditions.append(
                User.is_active == is_active
            )

        if role_id is not None:
            self._validate_role(role_id)

            conditions.append(
                User.role_id == role_id
            )

        if search:
            search_value = search.strip()

            if search_value:
                pattern = f"%{search_value}%"

                conditions.append(
                    (
                        User.email.ilike(pattern)
                        | User.username.ilike(pattern)
                        | User.first_name.ilike(pattern)
                        | User.last_name.ilike(pattern)
                    )
                )

        count_statement = (
            select(func.count(User.id))
            .where(*conditions)
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        statement = (
            select(User)
            .where(*conditions)
            .order_by(User.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        users = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        return users, int(total or 0)

    # ================================================================
    # UPDATE
    # ================================================================

    def update(
        self,
        *,
        user_id: int,
        email: str | None = None,
        username: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        role_id: int | None = None,
        is_active: bool | None = None,
    ) -> User:

        user = self.get(user_id)

        if email is not None:
            normalized_email = self._normalize_email(email)

            existing = self._find_by_email(
                normalized_email
            )

            if (
                existing is not None
                and existing.id != user.id
            ):
                raise UserAlreadyExistsError(
                    f"User with email "
                    f"'{normalized_email}' already exists."
                )

            user.email = normalized_email

        if username is not None:
            username = self._normalize_username(
                username
            )

            statement = (
                select(User)
                .where(
                    User.username == username
                )
                .limit(1)
            )

            existing = self.session.execute(
                statement
            ).scalar_one_or_none()

            if (
                existing is not None
                and existing.id != user.id
            ):
                raise UserAlreadyExistsError(
                    f"Username '{username}' already exists."
                )

            user.username = username

        if first_name is not None:
            user.first_name = self._normalize_name_part(
                first_name,
                "First name",
            )

        if last_name is not None:
            user.last_name = self._normalize_name_part(
                last_name,
                "Last name",
            )

        if role_id is not None:
            self._validate_role(role_id)
            user.role_id = role_id

        if is_active is not None:
            user.is_active = is_active

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise UserAlreadyExistsError(
                "User update violates a database constraint."
            ) from exc

        self.session.refresh(user)

        return user

    # ================================================================
    # PASSWORD
    # ================================================================

    def change_password(
        self,
        *,
        user_id: int,
        new_password: str,
    ) -> User:

        user = self.get(user_id)

        self._validate_password(new_password)

        user.password_hash = get_password_hash(
            new_password
        )

        self.session.commit()
        self.session.refresh(user)

        return user

    # ================================================================
    # ACTIVATE
    # ================================================================

    def activate(self, user_id: int) -> User:

        user = self.get(user_id)

        if user.is_active:
            return user

        user.is_active = True

        self.session.commit()
        self.session.refresh(user)

        return user

    # ================================================================
    # DEACTIVATE
    # ================================================================

    def deactivate(self, user_id: int) -> User:

        user = self.get(user_id)

        if not user.is_active:
            return user

        user.is_active = False

        self.session.commit()
        self.session.refresh(user)

        return user

    # ================================================================
    # ROLE ASSIGNMENT
    # ================================================================

    def assign_role(
        self,
        *,
        user_id: int,
        role_id: int,
    ) -> User:

        user = self.get(user_id)

        self._validate_role(role_id)

        user.role_id = role_id

        self.session.commit()
        self.session.refresh(user)

        return user

    # ================================================================
    # REMOVE ROLE
    # ================================================================

    def remove_role(self, user_id: int) -> User:

        # role_id is nullable=False in the current User model.
        raise UserValidationError(
            "A user must always have a role. "
            "Assign another role instead of removing it."
        )

    # ================================================================
    # EXISTS
    # ================================================================

    def exists(self, email: str) -> bool:

        normalized_email = self._normalize_email(email)

        return (
            self._find_by_email(normalized_email)
            is not None
        )

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(user: User) -> dict[str, Any]:

        return {
            "id": getattr(user, "id", None),
            "username": getattr(
                user,
                "username",
                None,
            ),
            "email": getattr(
                user,
                "email",
                None,
            ),
            "first_name": getattr(
                user,
                "first_name",
                None,
            ),
            "last_name": getattr(
                user,
                "last_name",
                None,
            ),
            "role_id": getattr(
                user,
                "role_id",
                None,
            ),
            "is_active": getattr(
                user,
                "is_active",
                None,
            ),
            "is_superuser": getattr(
                user,
                "is_superuser",
                None,
            ),
            "created_at": (
                user.created_at.isoformat()
                if getattr(
                    user,
                    "created_at",
                    None,
                )
                is not None
                else None
            ),
            "updated_at": (
                user.updated_at.isoformat()
                if getattr(
                    user,
                    "updated_at",
                    None,
                )
                is not None
                else None
            ),
        }

    # ================================================================
    # INTERNAL LOOKUPS
    # ================================================================

    def _find_by_email(
        self,
        email: str,
    ) -> User | None:

        statement = (
            select(User)
            .where(User.email == email)
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def _validate_role(
        self,
        role_id: int,
    ) -> Role:

        statement = (
            select(Role)
            .where(Role.id == role_id)
            .limit(1)
        )

        role = self.session.execute(
            statement
        ).scalar_one_or_none()

        if role is None:
            raise UserValidationError(
                f"Role {role_id} does not exist."
            )

        return role

    def _make_unique_username(
        self,
        username: str,
    ) -> str:

        username = self._normalize_username(
            username
        )

        base_username = username
        counter = 1

        while True:

            statement = (
                select(User.id)
                .where(
                    User.username == username
                )
                .limit(1)
            )

            exists = self.session.execute(
                statement
            ).scalar_one_or_none()

            if exists is None:
                return username

            counter += 1
            username = (
                f"{base_username}{counter}"
            )

    # ================================================================
    # VALIDATION
    # ================================================================

    @staticmethod
    def _normalize_email(email: str) -> str:

        if not isinstance(email, str):
            raise UserValidationError(
                "Email must be a string."
            )

        value = email.strip().lower()

        if not value:
            raise UserValidationError(
                "Email cannot be empty."
            )

        if len(value) > 255:
            raise UserValidationError(
                "Email cannot exceed 255 characters."
            )

        if "@" not in value:
            raise UserValidationError(
                "Invalid email address."
            )

        local, _, domain = value.partition("@")

        if not local or not domain:
            raise UserValidationError(
                "Invalid email address."
            )

        return value

    @staticmethod
    def _normalize_username(
        username: str,
    ) -> str:

        if not isinstance(username, str):
            raise UserValidationError(
                "Username must be a string."
            )

        value = username.strip().lower()

        if not value:
            raise UserValidationError(
                "Username cannot be empty."
            )

        if len(value) > 100:
            raise UserValidationError(
                "Username cannot exceed 100 characters."
            )

        return value

    @staticmethod
    def _normalize_name_part(
        value: str,
        field_name: str,
    ) -> str:

        if not isinstance(value, str):
            raise UserValidationError(
                f"{field_name} must be a string."
            )

        value = " ".join(
            value.strip().split()
        )

        if not value:
            raise UserValidationError(
                f"{field_name} cannot be empty."
            )

        if len(value) > 100:
            raise UserValidationError(
                f"{field_name} cannot exceed 100 characters."
            )

        return value

    @classmethod
    def _normalize_name(
        cls,
        name: str,
    ) -> str:

        if not isinstance(name, str):
            raise UserValidationError(
                "Full name must be a string."
            )

        value = " ".join(
            name.strip().split()
        )

        if not value:
            raise UserValidationError(
                "Full name cannot be empty."
            )

        if len(value) > 201:
            raise UserValidationError(
                "Full name is too long."
            )

        return value

    @staticmethod
    def _validate_password(
        password: str,
    ) -> None:

        if not isinstance(password, str):
            raise UserValidationError(
                "Password must be a string."
            )

        if len(password) < 8:
            raise UserValidationError(
                "Password must contain at least 8 characters."
            )

        if len(password) > 128:
            raise UserValidationError(
                "Password cannot exceed 128 characters."
            )

        if not any(
            char.isupper()
            for char in password
        ):
            raise UserValidationError(
                "Password must contain at least one uppercase letter."
            )

        if not any(
            char.islower()
            for char in password
        ):
            raise UserValidationError(
                "Password must contain at least one lowercase letter."
            )

        if not any(
            char.isdigit()
            for char in password
        ):
            raise UserValidationError(
                "Password must contain at least one number."
            )

        if not any(
            not char.isalnum()
            for char in password
        ):
            raise UserValidationError(
                "Password must contain at least one special character."
            )