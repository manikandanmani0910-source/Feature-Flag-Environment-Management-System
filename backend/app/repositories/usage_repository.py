from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.feature_usage import FeatureUsage


class UsageRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_daily_usage(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        usage_date: date,
    ) -> FeatureUsage | None:
        statement = select(FeatureUsage).where(
            FeatureUsage.feature_flag_id
            == feature_flag_id,
            FeatureUsage.environment_id
            == environment_id,
            FeatureUsage.usage_date == usage_date,
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def create_daily_usage(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
        usage_date: date,
    ) -> FeatureUsage:
        usage = FeatureUsage(
            feature_flag_id=feature_flag_id,
            environment_id=environment_id,
            usage_date=usage_date,
            evaluation_count=0,
            enabled_count=0,
            disabled_count=0,
            unique_user_count=0,
        )

        self.session.add(usage)
        self.session.flush()
        self.session.refresh(usage)

        return usage

    def increment_evaluation(
        self,
        usage: FeatureUsage,
        *,
        enabled: bool,
    ) -> FeatureUsage:
        usage.evaluation_count += 1

        if enabled:
            usage.enabled_count += 1
        else:
            usage.disabled_count += 1

        self.session.flush()

        return usage

    def set_unique_user_count(
        self,
        usage: FeatureUsage,
        count: int,
    ) -> FeatureUsage:
        usage.unique_user_count = count

        self.session.flush()

        return usage

    def get_summary(
        self,
        *,
        feature_flag_id: int,
        environment_id: int,
    ) -> dict[str, int]:
        statement = select(
            func.coalesce(
                func.sum(
                    FeatureUsage.evaluation_count
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    FeatureUsage.enabled_count
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    FeatureUsage.disabled_count
                ),
                0,
            ),
            func.coalesce(
                func.max(
                    FeatureUsage.unique_user_count
                ),
                0,
            ),
        ).where(
            FeatureUsage.feature_flag_id
            == feature_flag_id,
            FeatureUsage.environment_id
            == environment_id,
        )

        result = self.session.execute(
            statement
        ).one()

        return {
            "total_evaluations": int(result[0]),
            "total_enabled": int(result[1]),
            "total_disabled": int(result[2]),
            "unique_users": int(result[3]),
        }