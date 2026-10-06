from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.feature_schedule import FeatureSchedule


class ScheduleRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        start_time: datetime,
        end_time: datetime | None,
    ) -> FeatureSchedule:
        schedule = FeatureSchedule(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            start_time=start_time,
            end_time=end_time,
        )

        self.session.add(schedule)
        self.session.flush()
        self.session.refresh(schedule)

        return schedule

    def get_by_id(
        self,
        schedule_id: int,
    ) -> FeatureSchedule | None:
        statement = select(FeatureSchedule).where(
            FeatureSchedule.id == schedule_id
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_by_feature(
        self,
        feature_flag_id: int,
        *,
        environment_id: int | None = None,
    ) -> list[FeatureSchedule]:
        statement = select(
            FeatureSchedule
        ).where(
            FeatureSchedule.feature_flag_id
            == feature_flag_id
        )

        if environment_id is not None:
            statement = statement.where(
                FeatureSchedule.environment_id
                == environment_id
            )

        statement = statement.order_by(
            FeatureSchedule.start_time.asc()
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    def get_active_schedule(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        current_time: datetime,
    ) -> FeatureSchedule | None:
        statement = (
            select(FeatureSchedule)
            .where(
                FeatureSchedule.feature_flag_id
                == feature_flag_id,
                FeatureSchedule.environment_id
                == environment_id,
                FeatureSchedule.start_time
                <= current_time,
                (
                    FeatureSchedule.end_time.is_(None)
                    | (
                        FeatureSchedule.end_time
                        > current_time
                    )
                ),
            )
            .order_by(
                FeatureSchedule.start_time.desc()
            )
            .limit(1)
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def update(
        self,
        schedule: FeatureSchedule,
        *,
        start_time: datetime | None = None,
        end_time: datetime | None = None,
        status: str | None = None,
    ) -> FeatureSchedule:
        if start_time is not None:
            schedule.start_time = start_time

        if end_time is not None:
            schedule.end_time = end_time

        if status is not None:
            schedule.status = status

        self.session.flush()
        self.session.refresh(schedule)

        return schedule

    def delete(
        self,
        schedule: FeatureSchedule,
    ) -> None:
        self.session.delete(schedule)
        self.session.flush()