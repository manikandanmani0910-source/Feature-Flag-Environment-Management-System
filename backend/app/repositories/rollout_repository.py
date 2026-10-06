from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.feature_rollout import FeatureRollout


class RolloutRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        is_enabled: bool,
        rollout_percentage: Decimal,
        targeting_enabled: bool,
    ) -> FeatureRollout:
        rollout = FeatureRollout(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            is_enabled=is_enabled,
            rollout_percentage=rollout_percentage,
            targeting_enabled=targeting_enabled,
            version=1,
        )

        self.session.add(rollout)
        self.session.flush()
        self.session.refresh(rollout)

        return rollout

    def get_by_id(
        self,
        rollout_id: int,
    ) -> FeatureRollout | None:
        statement = (
            select(FeatureRollout)
            .options(
                selectinload(
                    FeatureRollout.user_assignments
                )
            )
            .where(
                FeatureRollout.id == rollout_id,
                FeatureRollout.deleted_at.is_(None),
            )
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_feature_environment(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> FeatureRollout | None:
        statement = select(FeatureRollout).where(
            FeatureRollout.feature_flag_id
            == feature_flag_id,
            FeatureRollout.environment_id
            == environment_id,
            FeatureRollout.deleted_at.is_(None),
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_by_feature(
        self,
        feature_flag_id: int,
    ) -> list[FeatureRollout]:
        statement = (
            select(FeatureRollout)
            .options(
                selectinload(
                    FeatureRollout.environment
                )
            )
            .where(
                FeatureRollout.feature_flag_id
                == feature_flag_id,
                FeatureRollout.deleted_at.is_(None),
            )
            .order_by(
                FeatureRollout.environment_id.asc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    def update(
        self,
        rollout: FeatureRollout,
        *,
        is_enabled: bool | None = None,
        rollout_percentage: Decimal | None = None,
        targeting_enabled: bool | None = None,
    ) -> FeatureRollout:
        if is_enabled is not None:
            rollout.is_enabled = is_enabled

        if rollout_percentage is not None:
            rollout.rollout_percentage = (
                rollout_percentage
            )

        if targeting_enabled is not None:
            rollout.targeting_enabled = (
                targeting_enabled
            )

        rollout.version += 1

        self.session.flush()
        self.session.refresh(rollout)

        return rollout

    def soft_delete(
        self,
        rollout: FeatureRollout,
    ) -> None:
        from sqlalchemy import func

        rollout.deleted_at = func.now()

        self.session.flush()