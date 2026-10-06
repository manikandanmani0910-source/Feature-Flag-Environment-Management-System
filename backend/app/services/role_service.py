from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.role import Role


class RoleServiceError(Exception):
    """Base exception for role operations."""


class RoleNotFoundError(RoleServiceError):
    """Raised when a role does not exist."""


class RoleAlreadyExistsError(RoleServiceError):
    """Raised when a role already exists."""


class RoleValidationError(RoleServiceError):
    """Raised when role data is invalid."""


class RoleService:
    """
    Enterprise role management service.

    Responsibilities:
    - Create roles
    - Retrieve roles
    - Update roles
    - Delete roles
    - Activate/deactivate roles where supported
    - Search and paginate roles
    - Prevent duplicate role names
    - Generate audit-safe snapshots
    """

    SYSTEM_ROLES = {
        "admin",
        "manager",
        "developer",
        "viewer",
    }

    def __init__(
        self,
        session: Session,
    ) -> None:
        self.session = session

    # ================================================================
    # CREATE
    # ================================================================

    def create(
        self,
        *,
        name: str,
        description: str | None = None,
        is_active: bool = True,
    ) -> Role:

        normalized_name = (
            self._normalize_name(name)
        )

        existing = self._find_by_name(
            normalized_name
        )

        if existing is not None:
            raise RoleAlreadyExistsError(
                f"Role '{normalized_name}' "
                "already exists."
            )

        role = Role(
            name=normalized_name,
            description=(
                description.strip()
                if description is not None
                else None
            ),
            is_active=is_active,
        )

        self.session.add(role)

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise RoleAlreadyExistsError(
                f"Role '{normalized_name}' "
                "already exists."
            ) from exc

        self.session.refresh(role)

        return role

    # ================================================================
    # GET
    # ================================================================

    def get(
        self,
        role_id: int,
    ) -> Role:

        statement = (
            select(Role)
            .where(
                Role.id == role_id
            )
            .limit(1)
        )

        role = self.session.execute(
            statement
        ).scalar_one_or_none()

        if role is None:
            raise RoleNotFoundError(
                f"Role {role_id} was not found."
            )

        return role

    # ================================================================
    # GET BY NAME
    # ================================================================

    def get_by_name(
        self,
        name: str,
    ) -> Role:

        normalized_name = (
            self._normalize_name(name)
        )

        role = self._find_by_name(
            normalized_name
        )

        if role is None:
            raise RoleNotFoundError(
                f"Role '{normalized_name}' "
                "was not found."
            )

        return role

    # ================================================================
    # LIST
    # ================================================================

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[Role], int]:

        if page < 1:
            raise RoleValidationError(
                "page must be greater than zero."
            )

        if page_size < 1 or page_size > 100:
            raise RoleValidationError(
                "page_size must be between 1 and 100."
            )

        conditions: list[Any] = []

        if is_active is not None:
            conditions.append(
                Role.is_active
                == is_active
            )

        if search:
            value = search.strip()

            if value:
                pattern = f"%{value}%"

                conditions.append(
                    Role.name.ilike(
                        pattern
                    )
                )

        count_statement = (
            select(
                func.count(Role.id)
            )
            .where(*conditions)
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        statement = (
            select(Role)
            .where(*conditions)
            .order_by(
                Role.name.asc()
            )
            .offset(
                (page - 1) * page_size
            )
            .limit(page_size)
        )

        roles = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        return roles, int(
            total or 0
        )

    # ================================================================
    # UPDATE
    # ================================================================

    def update(
        self,
        *,
        role_id: int,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> Role:

        role = self.get(
            role_id
        )

        if name is not None:
            normalized_name = (
                self._normalize_name(name)
            )

            existing = self._find_by_name(
                normalized_name
            )

            if (
                existing is not None
                and existing.id != role.id
            ):
                raise RoleAlreadyExistsError(
                    f"Role '{normalized_name}' "
                    "already exists."
                )

            role.name = normalized_name

        if description is not None:
            role.description = (
                description.strip()
            )

        if is_active is not None:
            role.is_active = is_active

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise RoleAlreadyExistsError(
                "Role update violates "
                "a uniqueness constraint."
            ) from exc

        self.session.refresh(role)

        return role

    # ================================================================
    # ACTIVATE
    # ================================================================

    def activate(
        self,
        role_id: int,
    ) -> Role:

        role = self.get(
            role_id
        )

        if role.is_active:
            return role

        role.is_active = True

        self.session.commit()
        self.session.refresh(role)

        return role

    # ================================================================
    # DEACTIVATE
    # ================================================================

    def deactivate(
        self,
        role_id: int,
    ) -> Role:

        role = self.get(
            role_id
        )

        if not role.is_active:
            return role

        role.is_active = False

        self.session.commit()
        self.session.refresh(role)

        return role

    # ================================================================
    # DELETE
    # ================================================================

    def delete(
        self,
        role_id: int,
    ) -> None:

        role = self.get(
            role_id
        )

        self.session.delete(
            role
        )

        self.session.commit()

    # ================================================================
    # EXISTS
    # ================================================================

    def exists(
        self,
        name: str,
    ) -> bool:

        normalized_name = (
            self._normalize_name(name)
        )

        return (
            self._find_by_name(
                normalized_name
            )
            is not None
        )

    # ================================================================
    # SYSTEM ROLE CHECK
    # ================================================================

    @classmethod
    def is_system_role(
        cls,
        role: Role,
    ) -> bool:

        name = getattr(
            role,
            "name",
            "",
        )

        return (
            str(name).lower()
            in cls.SYSTEM_ROLES
        )

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(
        role: Role,
    ) -> dict[str, Any]:

        return {
            "id": getattr(
                role,
                "id",
                None,
            ),
            "name": getattr(
                role,
                "name",
                None,
            ),
            "description": getattr(
                role,
                "description",
                None,
            ),
            "is_active": getattr(
                role,
                "is_active",
                None,
            ),
            "created_at": (
                role.created_at.isoformat()
                if getattr(
                    role,
                    "created_at",
                    None,
                )
                is not None
                else None
            ),
            "updated_at": (
                role.updated_at.isoformat()
                if getattr(
                    role,
                    "updated_at",
                    None,
                )
                is not None
                else None
            ),
        }

    # ================================================================
    # INTERNAL LOOKUP
    # ================================================================

    def _find_by_name(
        self,
        name: str,
    ) -> Role | None:

        statement = (
            select(Role)
            .where(
                Role.name == name
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
    def _normalize_name(
        name: str,
    ) -> str:

        if not isinstance(
            name,
            str,
        ):
            raise RoleValidationError(
                "Role name must be a string."
            )

        value = (
            name.strip()
            .lower()
        )

        if not value:
            raise RoleValidationError(
                "Role name cannot be empty."
            )

        if len(value) > 100:
            raise RoleValidationError(
                "Role name cannot exceed "
                "100 characters."
            )

        return value