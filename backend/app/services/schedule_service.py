from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.feature_flag import FeatureFlag
from app.models.feature_schedule import FeatureSchedule
from app.services.cache_service import CacheService


class ScheduleServiceError(Exception):
    """Base exception for schedule operations."""


class ScheduleNotFoundError(ScheduleServiceError):
    """Raised when a schedule does not exist."""


class ScheduleConflictError(ScheduleServiceError):
    """Raised when schedules overlap."""


class InvalidScheduleError(ScheduleServiceError):
    """Raised when schedule data is invalid."""


class FeatureNotFoundForScheduleError(ScheduleServiceError):
    """Raised when the feature flag does not exist."""


class ScheduleService:
    """
    Enterprise feature activation scheduling service.

    Supports:
    - Scheduled feature activation
    - Scheduled feature deactivation
    - Environment-specific schedules
    - Schedule validation
    - Overlap prevention
    - Schedule cancellation
    - Cache invalidation
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
        activate_at: datetime,
        deactivate_at: datetime | None = None,
        is_active: bool = True,
    ) -> FeatureSchedule:

        self._validate_datetime_range(
            activate_at=activate_at,
            deactivate_at=deactivate_at,
        )

        feature = self._get_feature(
            feature_flag_id
        )

        if feature is None:
            raise FeatureNotFoundForScheduleError(
                f"Feature flag {feature_flag_id} "
                "does not exist."
            )

        self._validate_no_overlap(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            activate_at=activate_at,
            deactivate_at=deactivate_at,
        )

        schedule = FeatureSchedule(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            activate_at=self._ensure_utc(
                activate_at
            ),
            deactivate_at=(
                self._ensure_utc(
                    deactivate_at
                )
                if deactivate_at is not None
                else None
            ),
            is_active=is_active,
        )

        self.session.add(schedule)
        self.session.commit()
        self.session.refresh(schedule)

        self._invalidate_cache(
            feature=feature,
            environment_id=environment_id,
        )

        return schedule

    # ================================================================
    # GET
    # ================================================================

    def get(
        self,
        schedule_id: int,
    ) -> FeatureSchedule:

        statement = (
            select(FeatureSchedule)
            .where(
                FeatureSchedule.id == schedule_id
            )
        )

        schedule = self.session.execute(
            statement
        ).scalar_one_or_none()

        if schedule is None:
            raise ScheduleNotFoundError(
                f"Schedule {schedule_id} "
                "was not found."
            )

        return schedule

    # ================================================================
    # LIST
    # ================================================================

    def list_for_feature(
        self,
        *,
        feature_flag_id: int,
        environment_id: int | None = None,
    ) -> list[FeatureSchedule]:

        conditions = [
            FeatureSchedule.feature_flag_id
            == feature_flag_id
        ]

        if environment_id is not None:
            conditions.append(
                FeatureSchedule.environment_id
                == environment_id
            )

        statement = (
            select(FeatureSchedule)
            .where(and_(*conditions))
            .order_by(
                FeatureSchedule.activate_at.asc()
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
        schedule_id: int,
        activate_at: datetime | None = None,
        deactivate_at: datetime | None = None,
        is_active: bool | None = None,
    ) -> FeatureSchedule:

        schedule = self.get(
            schedule_id
        )

        new_activate_at = (
            activate_at
            if activate_at is not None
            else schedule.activate_at
        )

        new_deactivate_at = (
            deactivate_at
            if deactivate_at is not None
            else schedule.deactivate_at
        )

        self._validate_datetime_range(
            activate_at=new_activate_at,
            deactivate_at=new_deactivate_at,
        )

        self._validate_no_overlap(
            feature_flag_id=schedule.feature_flag_id,
            environment_id=schedule.environment_id,
            activate_at=new_activate_at,
            deactivate_at=new_deactivate_at,
            exclude_schedule_id=schedule.id,
        )

        if activate_at is not None:
            schedule.activate_at = (
                self._ensure_utc(
                    activate_at
                )
            )

        if deactivate_at is not None:
            schedule.deactivate_at = (
                self._ensure_utc(
                    deactivate_at
                )
            )

        if is_active is not None:
            schedule.is_active = is_active

        self.session.commit()
        self.session.refresh(schedule)

        feature = self._get_feature(
            schedule.feature_flag_id
        )

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=schedule.environment_id,
            )

        return schedule

    # ================================================================
    # ACTIVATE SCHEDULE
    # ================================================================

    def activate(
        self,
        schedule_id: int,
    ) -> FeatureSchedule:

        schedule = self.get(
            schedule_id
        )

        if schedule.is_active:
            return schedule

        schedule.is_active = True

        self.session.commit()
        self.session.refresh(schedule)

        feature = self._get_feature(
            schedule.feature_flag_id
        )

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=schedule.environment_id,
            )

        return schedule

    # ================================================================
    # DEACTIVATE SCHEDULE
    # ================================================================

    def deactivate(
        self,
        schedule_id: int,
    ) -> FeatureSchedule:

        schedule = self.get(
            schedule_id
        )

        if not schedule.is_active:
            return schedule

        schedule.is_active = False

        self.session.commit()
        self.session.refresh(schedule)

        feature = self._get_feature(
            schedule.feature_flag_id
        )

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=schedule.environment_id,
            )

        return schedule

    # ================================================================
    # CANCEL
    # ================================================================

    def cancel(
        self,
        schedule_id: int,
    ) -> FeatureSchedule:

        schedule = self.get(
            schedule_id
        )

        schedule.is_active = False

        self.session.commit()
        self.session.refresh(schedule)

        feature = self._get_feature(
            schedule.feature_flag_id
        )

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=schedule.environment_id,
            )

        return schedule

    # ================================================================
    # DELETE
    # ================================================================

    def delete(
        self,
        schedule_id: int,
    ) -> None:

        schedule = self.get(
            schedule_id
        )

        feature = self._get_feature(
            schedule.feature_flag_id
        )

        environment_id = schedule.environment_id

        self.session.delete(schedule)
        self.session.commit()

        if feature is not None:
            self._invalidate_cache(
                feature=feature,
                environment_id=environment_id,
            )

    # ================================================================
    # ACTIVE SCHEDULE
    # ================================================================

    def get_active_schedule(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureSchedule | None:

        now = datetime.now(
            timezone.utc
        )

        statement = (
            select(FeatureSchedule)
            .where(
                and_(
                    FeatureSchedule.feature_flag_id
                    == feature_flag_id,
                    FeatureSchedule.environment_id
                    == environment_id,
                    FeatureSchedule.is_active.is_(True),
                    FeatureSchedule.activate_at
                    <= now,
                    (
                        FeatureSchedule.deactivate_at
                        .is_(None)
                        |
                        (
                            FeatureSchedule.deactivate_at
                            > now
                        )
                    ),
                )
            )
            .order_by(
                FeatureSchedule.activate_at.desc()
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # PENDING SCHEDULE
    # ================================================================

    def get_pending_schedule(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureSchedule | None:

        now = datetime.now(
            timezone.utc
        )

        statement = (
            select(FeatureSchedule)
            .where(
                and_(
                    FeatureSchedule.feature_flag_id
                    == feature_flag_id,
                    FeatureSchedule.environment_id
                    == environment_id,
                    FeatureSchedule.is_active.is_(True),
                    FeatureSchedule.activate_at
                    > now,
                )
            )
            .order_by(
                FeatureSchedule.activate_at.asc()
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    # ================================================================
    # EXPIRED SCHEDULE
    # ================================================================

    def get_expired_schedules(
        self,
        *,
        feature_flag_id: int | None = None,
    ) -> list[FeatureSchedule]:

        now = datetime.now(
            timezone.utc
        )

        conditions = [
            FeatureSchedule.is_active.is_(True),
            FeatureSchedule.deactivate_at
            .is_not(None),
            FeatureSchedule.deactivate_at
            <= now,
        ]

        if feature_flag_id is not None:
            conditions.append(
                FeatureSchedule.feature_flag_id
                == feature_flag_id
            )

        statement = (
            select(FeatureSchedule)
            .where(and_(*conditions))
            .order_by(
                FeatureSchedule.deactivate_at.asc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    # ================================================================
    # VALIDATION
    # ================================================================

    @staticmethod
    def _validate_datetime_range(
        *,
        activate_at: datetime,
        deactivate_at: datetime | None,
    ) -> None:

        if activate_at is None:
            raise InvalidScheduleError(
                "activate_at is required."
            )

        if deactivate_at is not None:
            if (
                ScheduleService._ensure_utc(
                    deactivate_at
                )
                <= ScheduleService._ensure_utc(
                    activate_at
                )
            ):
                raise InvalidScheduleError(
                    "deactivate_at must be later "
                    "than activate_at."
                )

    def _validate_no_overlap(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        activate_at: datetime,
        deactivate_at: datetime | None,
        exclude_schedule_id: int | None = None,
    ) -> None:

        new_start = self._ensure_utc(
            activate_at
        )

        new_end = (
            self._ensure_utc(
                deactivate_at
            )
            if deactivate_at is not None
            else None
        )

        statement = (
            select(FeatureSchedule)
            .where(
                and_(
                    FeatureSchedule.feature_flag_id
                    == feature_flag_id,
                    FeatureSchedule.environment_id
                    == environment_id,
                )
            )
        )

        schedules = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        for existing in schedules:

            if (
                exclude_schedule_id is not None
                and existing.id
                == exclude_schedule_id
            ):
                continue

            existing_start = (
                self._ensure_utc(
                    existing.activate_at
                )
            )

            existing_end = (
                self._ensure_utc(
                    existing.deactivate_at
                )
                if existing.deactivate_at is not None
                else None
            )

            if self._ranges_overlap(
                new_start,
                new_end,
                existing_start,
                existing_end,
            ):
                raise ScheduleConflictError(
                    "The requested schedule overlaps "
                    f"with schedule {existing.id}."
                )

    @staticmethod
    def _ranges_overlap(
        start_a: datetime,
        end_a: datetime | None,
        start_b: datetime,
        end_b: datetime | None,
    ) -> bool:

        effective_end_a = (
            end_a
            if end_a is not None
            else datetime.max.replace(
                tzinfo=timezone.utc
            )
        )

        effective_end_b = (
            end_b
            if end_b is not None
            else datetime.max.replace(
                tzinfo=timezone.utc
            )
        )

        return (
            start_a < effective_end_b
            and start_b < effective_end_a
        )

    # ================================================================
    # INTERNAL HELPERS
    # ================================================================

    def _get_feature(
        self,
        feature_flag_id: int,
    ) -> FeatureFlag | None:

        statement = (
            select(FeatureFlag)
            .where(
                FeatureFlag.id
                == feature_flag_id
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def _invalidate_cache(
        self,
        *,
        feature: FeatureFlag,
        environment_id: int,
    ) -> None:
        """
        Environment name is resolved only when available on the model.
        """

        environment_name = getattr(
            feature,
            "environment",
            None,
        )

        if environment_name is not None:
            self.cache.invalidate_feature_everywhere(
                feature_key=feature.key,
                environment=str(
                    environment_name
                ),
            )

        self.cache.invalidate_dashboard()

    @staticmethod
    def _ensure_utc(
        value: datetime,
    ) -> datetime:

        if value.tzinfo is None:
            return value.replace(
                tzinfo=timezone.utc
            )

        return value.astimezone(
            timezone.utc
        )