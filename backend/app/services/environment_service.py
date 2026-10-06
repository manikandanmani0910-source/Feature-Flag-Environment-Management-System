from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.environment import Environment


class EnvironmentServiceError(Exception):
    """Base exception for environment operations."""


class EnvironmentNotFoundError(EnvironmentServiceError):
    """Raised when an environment does not exist."""


class EnvironmentAlreadyExistsError(EnvironmentServiceError):
    """Raised when an environment already exists."""


class EnvironmentValidationError(EnvironmentServiceError):
    """Raised when environment data is invalid."""


class EnvironmentService:
    """
    Enterprise environment management service.

    Responsibilities:
    - Create environments
    - Retrieve environments
    - Update environments
    - Enable / disable environments
    - Soft-delete environments where supported
    - Prevent duplicate environment names/keys
    - Provide audit-ready snapshots
    """

    ALLOWED_ENVIRONMENTS = {
        "development",
        "testing",
        "production",
    }

    def __init__(self, session: Session) -> None:
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
    ) -> Environment:
        normalized_name = self._normalize_name(name)

        self._validate_environment_name(
            normalized_name
        )

        existing = self._find_by_name(
            normalized_name
        )

        if existing is not None:
            raise EnvironmentAlreadyExistsError(
                f"Environment '{normalized_name}' "
                "already exists."
            )

        environment = Environment(
            name=normalized_name,
            description=(
                description.strip()
                if description is not None
                else None
            ),
            is_active=is_active,
        )

        self.session.add(environment)

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise EnvironmentAlreadyExistsError(
                f"Environment '{normalized_name}' "
                "already exists."
            ) from exc

        self.session.refresh(environment)

        return environment

    # ================================================================
    # GET
    # ================================================================

    def get(
        self,
        environment_id: int,
    ) -> Environment:
        statement = (
            select(Environment)
            .where(
                Environment.id
                == environment_id
            )
            .limit(1)
        )

        environment = self.session.execute(
            statement
        ).scalar_one_or_none()

        if environment is None:
            raise EnvironmentNotFoundError(
                f"Environment {environment_id} "
                "was not found."
            )

        return environment

    # ================================================================
    # GET BY NAME
    # ================================================================

    def get_by_name(
        self,
        name: str,
    ) -> Environment:
        normalized_name = self._normalize_name(
            name
        )

        environment = self._find_by_name(
            normalized_name
        )

        if environment is None:
            raise EnvironmentNotFoundError(
                f"Environment '{normalized_name}' "
                "was not found."
            )

        return environment

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
    ) -> tuple[list[Environment], int]:

        if page < 1:
            raise EnvironmentValidationError(
                "page must be greater than zero."
            )

        if page_size < 1 or page_size > 100:
            raise EnvironmentValidationError(
                "page_size must be between 1 and 100."
            )

        conditions: list[Any] = []

        if is_active is not None:
            conditions.append(
                Environment.is_active
                == is_active
            )

        if search:
            normalized_search = (
                search.strip()
            )

            if normalized_search:
                pattern = (
                    f"%{normalized_search}%"
                )

                conditions.append(
                    Environment.name.ilike(
                        pattern
                    )
                )

        count_statement = (
            select(
                func.count(
                    Environment.id
                )
            )
            .where(*conditions)
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        statement = (
            select(Environment)
            .where(*conditions)
            .order_by(
                Environment.name.asc()
            )
            .offset(
                (page - 1) * page_size
            )
            .limit(page_size)
        )

        environments = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        return environments, int(
            total or 0
        )

    # ================================================================
    # UPDATE
    # ================================================================

    def update(
        self,
        *,
        environment_id: int,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> Environment:

        environment = self.get(
            environment_id
        )

        if name is not None:
            normalized_name = (
                self._normalize_name(name)
            )

            self._validate_environment_name(
                normalized_name
            )

            existing = self._find_by_name(
                normalized_name
            )

            if (
                existing is not None
                and existing.id
                != environment.id
            ):
                raise EnvironmentAlreadyExistsError(
                    f"Environment "
                    f"'{normalized_name}' "
                    "already exists."
                )

            environment.name = (
                normalized_name
            )

        if description is not None:
            environment.description = (
                description.strip()
            )

        if is_active is not None:
            environment.is_active = (
                is_active
            )

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise EnvironmentAlreadyExistsError(
                "Environment update violates "
                "a uniqueness constraint."
            ) from exc

        self.session.refresh(environment)

        return environment

    # ================================================================
    # ACTIVATE
    # ================================================================

    def activate(
        self,
        environment_id: int,
    ) -> Environment:

        environment = self.get(
            environment_id
        )

        if environment.is_active:
            return environment

        environment.is_active = True

        self.session.commit()
        self.session.refresh(environment)

        return environment

    # ================================================================
    # DEACTIVATE
    # ================================================================

    def deactivate(
        self,
        environment_id: int,
    ) -> Environment:

        environment = self.get(
            environment_id
        )

        if not environment.is_active:
            return environment

        environment.is_active = False

        self.session.commit()
        self.session.refresh(environment)

        return environment

    # ================================================================
    # DELETE
    # ================================================================

    def delete(
        self,
        environment_id: int,
    ) -> None:

        environment = self.get(
            environment_id
        )

        # Prefer soft deletion when the model supports it.
        if hasattr(
            environment,
            "deleted_at",
        ):
            environment.deleted_at = (
                self._utc_now()
            )

            environment.is_active = False

            self.session.commit()

            return

        self.session.delete(
            environment
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
    # ACTIVE ENVIRONMENTS
    # ================================================================

    def get_active_environments(
        self,
    ) -> list[Environment]:

        statement = (
            select(Environment)
            .where(
                Environment.is_active
                .is_(True)
            )
            .order_by(
                Environment.name.asc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(
        environment: Environment,
    ) -> dict[str, Any]:
        """
        Audit-ready environment snapshot.
        """

        return {
            "id": getattr(
                environment,
                "id",
                None,
            ),
            "name": getattr(
                environment,
                "name",
                None,
            ),
            "description": getattr(
                environment,
                "description",
                None,
            ),
            "is_active": getattr(
                environment,
                "is_active",
                None,
            ),
            "created_at": (
                environment.created_at.isoformat()
                if getattr(
                    environment,
                    "created_at",
                    None,
                )
                is not None
                else None
            ),
            "updated_at": (
                environment.updated_at.isoformat()
                if getattr(
                    environment,
                    "updated_at",
                    None,
                )
                is not None
                else None
            ),
            "deleted_at": (
                environment.deleted_at.isoformat()
                if getattr(
                    environment,
                    "deleted_at",
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
    ) -> Environment | None:

        statement = (
            select(Environment)
            .where(
                Environment.name
                == name
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
            raise EnvironmentValidationError(
                "Environment name must be a string."
            )

        normalized = name.strip().lower()

        if not normalized:
            raise EnvironmentValidationError(
                "Environment name cannot be empty."
            )

        if len(normalized) > 100:
            raise EnvironmentValidationError(
                "Environment name cannot exceed "
                "100 characters."
            )

        return normalized

    def _validate_environment_name(
        self,
        name: str,
    ) -> None:
        """
        The platform currently defines three standard environments.

        Additional environments can be supported later by changing
        this policy rather than scattering validation across routers.
        """

        if name not in self.ALLOWED_ENVIRONMENTS:
            raise EnvironmentValidationError(
                "Invalid environment. "
                "Allowed values are: "
                "development, testing, production."
            )

    # ================================================================
    # TIME
    # ================================================================

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(
            timezone.utc
        )