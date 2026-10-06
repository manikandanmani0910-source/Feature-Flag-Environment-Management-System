from typing import Any

from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.repositories.feature_flag_repository import (
    FeatureFlagRepository,
)
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagUpdate,
)


class FeatureFlagError(Exception):
    """Base exception for feature flag operations."""


class FeatureFlagAlreadyExistsError(FeatureFlagError):
    """Raised when a feature flag key already exists."""


class FeatureFlagNotFoundError(FeatureFlagError):
    """Raised when a feature flag cannot be found."""


class FeatureFlagInactiveError(FeatureFlagError):
    """Raised when an operation requires an active feature flag."""


class FeatureFlagService:
    """
    Enterprise service for feature flag lifecycle management.

    Responsibilities:
    - Feature flag creation
    - Feature flag retrieval
    - Feature flag search/listing
    - Feature flag updates
    - Enable/disable operations
    - Soft deletion
    - Key normalization and uniqueness validation
    - Active-state validation
    - Audit snapshot generation
    """

    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = FeatureFlagRepository(session)

    # ------------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------------

    def create(
        self,
        request: FeatureFlagCreate,
    ) -> FeatureFlag:
        normalized_key = self._validate_key_available(
            request.key,
        )

        feature_flag = self.repository.create(
            key=normalized_key,
            name=request.name,
            description=request.description,
        )

        return feature_flag

    # ------------------------------------------------------------------
    # READ
    # ------------------------------------------------------------------

    def get(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:
        feature_flag = self.repository.get_by_id(
            feature_flag_id,
        )

        if feature_flag is None:
            raise FeatureFlagNotFoundError(
                f"Feature flag {feature_flag_id} was not found."
            )

        return feature_flag

    def get_by_key(
        self,
        key: str,
    ) -> FeatureFlag:
        normalized_key = self._normalize_key(key)

        feature_flag = self.repository.get_by_key(
            normalized_key,
        )

        if feature_flag is None:
            raise FeatureFlagNotFoundError(
                f"Feature flag '{normalized_key}' was not found."
            )

        return feature_flag

    def list(
        self,
        *,
        page: int,
        page_size: int,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[FeatureFlag], int]:
        normalized_search = (
            search.strip()
            if search is not None
            and search.strip()
            else None
        )

        return self.repository.list_features(
            page=page,
            page_size=page_size,
            is_active=is_active,
            search=normalized_search,
        )

    # ------------------------------------------------------------------
    # UPDATE
    # ------------------------------------------------------------------

    def update(
        self,
        feature_flag_id: int,
        request: FeatureFlagUpdate,
    ) -> FeatureFlag:
        feature_flag = self.get(
            feature_flag_id,
        )

        if (
            request.name is None
            and request.description is None
            and request.is_active is None
        ):
            return feature_flag

        return self.repository.update(
            feature_flag,
            name=(
                request.name.strip()
                if request.name is not None
                else None
            ),
            description=(
                request.description.strip()
                if request.description is not None
                else None
            ),
            is_active=request.is_active,
        )

    # ------------------------------------------------------------------
    # ENABLE
    # ------------------------------------------------------------------

    def enable(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:
        feature_flag = self.get(
            feature_flag_id,
        )

        if feature_flag.is_active:
            return feature_flag

        return self.repository.update(
            feature_flag,
            is_active=True,
        )

    # ------------------------------------------------------------------
    # DISABLE
    # ------------------------------------------------------------------

    def disable(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:
        feature_flag = self.get(
            feature_flag_id,
        )

        if not feature_flag.is_active:
            return feature_flag

        return self.repository.update(
            feature_flag,
            is_active=False,
        )

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------

    def delete(
        self,
        feature_flag_id: int,
    ) -> None:
        feature_flag = self.get(
            feature_flag_id,
        )

        self.repository.soft_delete(
            feature_flag,
        )

    # ------------------------------------------------------------------
    # ACTIVE STATE VALIDATION
    # ------------------------------------------------------------------

    def validate_active(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag:
        feature_flag = self.get(
            feature_flag_id,
        )

        if not feature_flag.is_active:
            raise FeatureFlagInactiveError(
                f"Feature flag '{feature_flag.key}' is inactive."
            )

        return feature_flag

    # ------------------------------------------------------------------
    # EXISTENCE CHECK
    # ------------------------------------------------------------------

    def exists(
        self,
        key: str,
    ) -> bool:
        normalized_key = self._normalize_key(key)

        feature_flag = self.repository.get_by_key(
            normalized_key,
            include_deleted=False,
        )

        return feature_flag is not None

    # ------------------------------------------------------------------
    # AUDIT SNAPSHOT
    # ------------------------------------------------------------------

    @staticmethod
    def snapshot(
        feature_flag: FeatureFlag,
    ) -> dict[str, Any]:
        """
        Creates a serializable representation of the feature flag.

        Used by the audit/change-history layer to store
        before/after state.
        """

        return {
            "id": feature_flag.id,
            "key": feature_flag.key,
            "name": feature_flag.name,
            "description": feature_flag.description,
            "is_active": feature_flag.is_active,
            "created_at": (
                feature_flag.created_at.isoformat()
                if feature_flag.created_at is not None
                else None
            ),
            "updated_at": (
                feature_flag.updated_at.isoformat()
                if feature_flag.updated_at is not None
                else None
            ),
            "deleted_at": (
                feature_flag.deleted_at.isoformat()
                if feature_flag.deleted_at is not None
                else None
            ),
        }

    # ------------------------------------------------------------------
    # INTERNAL VALIDATION
    # ------------------------------------------------------------------

    def _validate_key_available(
        self,
        key: str,
    ) -> str:
        normalized_key = self._normalize_key(key)

        existing = self.repository.get_by_key(
            normalized_key,
            include_deleted=True,
        )

        if existing is not None:
            raise FeatureFlagAlreadyExistsError(
                f"Feature flag '{normalized_key}' already exists."
            )

        return normalized_key

    @staticmethod
    def _normalize_key(
        key: str,
    ) -> str:
        if not isinstance(key, str):
            raise ValueError(
                "Feature flag key must be a string."
            )

        normalized_key = key.strip().lower()

        if not normalized_key:
            raise ValueError(
                "Feature flag key cannot be empty."
            )

        if len(normalized_key) > 255:
            raise ValueError(
                "Feature flag key cannot exceed 255 characters."
            )

        return normalized_key