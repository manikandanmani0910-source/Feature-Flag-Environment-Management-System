from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.feature_flag import FeatureFlag
from app.models.feature_rollout import FeatureRollout


class FeatureFlagRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        key: str,
        name: str,
        description: str | None = None,
    ) -> FeatureFlag:
        feature_flag = FeatureFlag(
            key=key,
            name=name,
            description=description,
            is_active=True,
        )

        self.session.add(feature_flag)
        self.session.flush()
        self.session.refresh(feature_flag)

        return feature_flag

    def get_by_id(
        self,
        feature_flag_id: int,
        *,
        include_deleted: bool = False,
    ) -> FeatureFlag | None:
        statement = (
            select(FeatureFlag)
            .options(
                selectinload(
                    FeatureFlag.rollouts
                )
            )
            .where(
                FeatureFlag.id == feature_flag_id
            )
        )

        if not include_deleted:
            statement = statement.where(
                FeatureFlag.deleted_at.is_(None)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_key(
        self,
        key: str,
        *,
        include_deleted: bool = False,
    ) -> FeatureFlag | None:
        statement = select(FeatureFlag).where(
            func.lower(FeatureFlag.key) == key.lower()
        )

        if not include_deleted:
            statement = statement.where(
                FeatureFlag.deleted_at.is_(None)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_features(
        self,
        *,
        page: int,
        page_size: int,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[FeatureFlag], int]:
        filters = [
            FeatureFlag.deleted_at.is_(None)
        ]

        if is_active is not None:
            filters.append(
                FeatureFlag.is_active == is_active
            )

        if search:
            pattern = f"%{search.strip().lower()}%"

            filters.append(
                func.lower(
                    FeatureFlag.name
                ).like(pattern)
                | func.lower(
                    FeatureFlag.key
                ).like(pattern)
            )

        statement = (
            select(FeatureFlag)
            .options(
                selectinload(
                    FeatureFlag.rollouts
                )
            )
            .where(*filters)
            .order_by(
                FeatureFlag.created_at.desc(),
                FeatureFlag.id.desc(),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_statement = (
            select(func.count(FeatureFlag.id))
            .where(*filters)
        )

        features = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        return features, total

    def update(
        self,
        feature_flag: FeatureFlag,
        *,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> FeatureFlag:
        if name is not None:
            feature_flag.name = name

        if description is not None:
            feature_flag.description = description

        if is_active is not None:
            feature_flag.is_active = is_active

        self.session.flush()
        self.session.refresh(feature_flag)

        return feature_flag

    def soft_delete(
        self,
        feature_flag: FeatureFlag,
    ) -> None:
        from sqlalchemy import func

        feature_flag.deleted_at = func.now()
        feature_flag.is_active = False

        self.session.flush()

    def get_rollout(
        self,
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