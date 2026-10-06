from __future__ import annotations

from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.environment import Environment
from app.models.feature_flag import FeatureFlag
from app.models.user import User
from app.models.user_assignment import UserAssignment
from app.services.cache_service import CacheService


class AssignmentServiceError(Exception):
    """Base exception for user-assignment operations."""


class AssignmentNotFoundError(AssignmentServiceError):
    """Raised when an assignment does not exist."""


class AssignmentAlreadyExistsError(AssignmentServiceError):
    """Raised when an assignment already exists."""


class AssignmentValidationError(AssignmentServiceError):
    """Raised when assignment data is invalid."""


class AssignmentService:
    """
    Enterprise user-targeting service.

    Responsibilities:
    - Assign a feature to a specific user
    - Remove user assignments
    - Enable / disable assignments
    - Environment-specific targeting
    - Duplicate prevention
    - Feature/user/environment validation
    - Redis evaluation-cache invalidation
    - Audit-ready snapshots
    """

    def __init__(
        self,
        session: Session,
        cache_service: CacheService | None = None,
    ) -> None:
        self.session = session
        self.cache = cache_service or CacheService()

    # ================================================================
    # CREATE
    # ================================================================

    def create(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        user_id: int,
        enabled: bool = True,
    ) -> UserAssignment:
        """
        Create an explicit feature assignment for one user.
        """

        self._validate_feature(
            feature_flag_id
        )

        self._validate_environment(
            environment_id
        )

        self._validate_user(
            user_id
        )

        existing = self._find_assignment(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

        if existing is not None:
            raise AssignmentAlreadyExistsError(
                "An assignment already exists for "
                f"user {user_id}, feature "
                f"{feature_flag_id}, environment "
                f"{environment_id}."
            )

        assignment = UserAssignment(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
            enabled=enabled,
        )

        self.session.add(assignment)

        try:
            self.session.commit()
        except IntegrityError as exc:
            self.session.rollback()

            raise AssignmentAlreadyExistsError(
                "The user assignment already exists "
                "or violates a database constraint."
            ) from exc

        self.session.refresh(assignment)

        self._invalidate_cache(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

        return assignment

    # ================================================================
    # GET
    # ================================================================

    def get(
        self,
        assignment_id: int,
    ) -> UserAssignment:
        statement = (
            select(UserAssignment)
            .where(
                UserAssignment.id
                == assignment_id
            )
            .limit(1)
        )

        assignment = self.session.execute(
            statement
        ).scalar_one_or_none()

        if assignment is None:
            raise AssignmentNotFoundError(
                f"Assignment {assignment_id} "
                "was not found."
            )

        return assignment

    # ================================================================
    # GET FOR USER
    # ================================================================

    def get_for_user(
        self,
        *,
        user_id: int,
        feature_flag_id: int,
        environment_id: int,
    ) -> UserAssignment | None:
        return self._find_assignment(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

    # ================================================================
    # LIST USER ASSIGNMENTS
    # ================================================================

    def list_for_user(
        self,
        *,
        user_id: int,
        environment_id: int | None = None,
    ) -> list[UserAssignment]:
        self._validate_user(
            user_id
        )

        conditions: list[Any] = [
            UserAssignment.user_id
            == user_id
        ]

        if environment_id is not None:
            self._validate_environment(
                environment_id
            )

            conditions.append(
                UserAssignment.environment_id
                == environment_id
            )

        statement = (
            select(UserAssignment)
            .where(*conditions)
            .order_by(
                UserAssignment.id.desc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # LIST FEATURE ASSIGNMENTS
    # ================================================================

    def list_for_feature(
        self,
        *,
        feature_flag_id: int,
        environment_id: int | None = None,
        enabled: bool | None = None,
    ) -> list[UserAssignment]:
        self._validate_feature(
            feature_flag_id
        )

        conditions: list[Any] = [
            UserAssignment.feature_flag_id
            == feature_flag_id
        ]

        if environment_id is not None:
            self._validate_environment(
                environment_id
            )

            conditions.append(
                UserAssignment.environment_id
                == environment_id
            )

        if enabled is not None:
            conditions.append(
                UserAssignment.enabled
                == enabled
            )

        statement = (
            select(UserAssignment)
            .where(*conditions)
            .order_by(
                UserAssignment.id.desc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # LIST ENVIRONMENT ASSIGNMENTS
    # ================================================================

    def list_for_environment(
        self,
        *,
        environment_id: int,
        feature_flag_id: int | None = None,
    ) -> list[UserAssignment]:
        self._validate_environment(
            environment_id
        )

        conditions: list[Any] = [
            UserAssignment.environment_id
            == environment_id
        ]

        if feature_flag_id is not None:
            self._validate_feature(
                feature_flag_id
            )

            conditions.append(
                UserAssignment.feature_flag_id
                == feature_flag_id
            )

        statement = (
            select(UserAssignment)
            .where(*conditions)
            .order_by(
                UserAssignment.id.desc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # UPDATE
    # ================================================================

    def update(
        self,
        *,
        assignment_id: int,
        enabled: bool,
    ) -> UserAssignment:
        assignment = self.get(
            assignment_id
        )

        if assignment.enabled == enabled:
            return assignment

        assignment.enabled = enabled

        self.session.commit()
        self.session.refresh(assignment)

        self._invalidate_cache(
            feature_flag_id=assignment.feature_flag_id,
            environment_id=assignment.environment_id,
            user_id=assignment.user_id,
        )

        return assignment

    # ================================================================
    # ENABLE
    # ================================================================

    def enable(
        self,
        assignment_id: int,
    ) -> UserAssignment:
        return self.update(
            assignment_id=assignment_id,
            enabled=True,
        )

    # ================================================================
    # DISABLE
    # ================================================================

    def disable(
        self,
        assignment_id: int,
    ) -> UserAssignment:
        return self.update(
            assignment_id=assignment_id,
            enabled=False,
        )

    # ================================================================
    # DELETE
    # ================================================================

    def delete(
        self,
        assignment_id: int,
    ) -> None:
        assignment = self.get(
            assignment_id
        )

        feature_flag_id = (
            assignment.feature_flag_id
        )

        environment_id = (
            assignment.environment_id
        )

        user_id = assignment.user_id

        self.session.delete(
            assignment
        )

        self.session.commit()

        self._invalidate_cache(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

    # ================================================================
    # REMOVE USER FROM FEATURE
    # ================================================================

    def remove_user(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        user_id: int,
    ) -> None:
        assignment = self._find_assignment(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

        if assignment is None:
            raise AssignmentNotFoundError(
                "No assignment exists for "
                f"user {user_id}."
            )

        self.session.delete(
            assignment
        )

        self.session.commit()

        self._invalidate_cache(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            user_id=user_id,
        )

    # ================================================================
    # SNAPSHOT
    # ================================================================

    @staticmethod
    def snapshot(
        assignment: UserAssignment,
    ) -> dict[str, Any]:
        """
        Generate an audit-ready assignment snapshot.
        """

        return {
            "id": getattr(
                assignment,
                "id",
                None,
            ),
            "feature_flag_id": getattr(
                assignment,
                "feature_flag_id",
                None,
            ),
            "environment_id": getattr(
                assignment,
                "environment_id",
                None,
            ),
            "user_id": getattr(
                assignment,
                "user_id",
                None,
            ),
            "enabled": getattr(
                assignment,
                "enabled",
                None,
            ),
            "created_at": (
                assignment.created_at.isoformat()
                if getattr(
                    assignment,
                    "created_at",
                    None,
                )
                is not None
                else None
            ),
            "updated_at": (
                assignment.updated_at.isoformat()
                if getattr(
                    assignment,
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

    def _find_assignment(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        user_id: int,
    ) -> UserAssignment | None:
        statement = (
            select(UserAssignment)
            .where(
                and_(
                    UserAssignment.feature_flag_id
                    == feature_flag_id,
                    UserAssignment.environment_id
                    == environment_id,
                    UserAssignment.user_id
                    == user_id,
                )
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # VALIDATION
    # ================================================================

    def _validate_feature(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:
        statement = (
            select(FeatureFlag)
            .where(
                FeatureFlag.id
                == feature_flag_id
            )
            .limit(1)
        )

        feature = self.session.execute(
            statement
        ).scalar_one_or_none()

        if feature is None:
            raise AssignmentValidationError(
                f"Feature flag {feature_flag_id} "
                "does not exist."
            )

        return feature

    def _validate_environment(
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
            raise AssignmentValidationError(
                f"Environment {environment_id} "
                "does not exist."
            )

        if not environment.is_active:
            raise AssignmentValidationError(
                f"Environment {environment_id} "
                "is inactive."
            )

        return environment

    def _validate_user(
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
            raise AssignmentValidationError(
                f"User {user_id} does not exist."
            )

        if hasattr(
            user,
            "is_active",
        ):
            if not user.is_active:
                raise AssignmentValidationError(
                    f"User {user_id} is inactive."
                )

        return user

    # ================================================================
    # CACHE INVALIDATION
    # ================================================================

    def _invalidate_cache(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        user_id: int,
    ) -> None:
        """
        Invalidate the exact user's evaluation cache.

        Also invalidates the feature/environment configuration
        and dashboard cache.
        """

        feature = self._validate_feature(
            feature_flag_id
        )

        environment = self._validate_environment(
            environment_id
        )

        self.cache.invalidate_evaluation(
            feature_key=feature.key,
            environment=environment.name,
            user_id=user_id,
        )

        self.cache.invalidate_feature(
            feature_key=feature.key,
            environment=environment.name,
        )

        self.cache.invalidate_dashboard(
            environment.name
        )