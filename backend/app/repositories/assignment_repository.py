from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.user_assignment import UserAssignment


class AssignmentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        feature_rollout_id: int,
        user_id: int,
        is_enabled: bool = True,
    ) -> UserAssignment:
        assignment = UserAssignment(
            feature_rollout_id=feature_rollout_id,
            user_id=user_id,
            is_enabled=is_enabled,
        )

        self.session.add(assignment)
        self.session.flush()
        self.session.refresh(assignment)

        return assignment

    def get_by_id(
        self,
        assignment_id: int,
    ) -> UserAssignment | None:
        statement = (
            select(UserAssignment)
            .options(
                selectinload(
                    UserAssignment.user
                )
            )
            .where(
                UserAssignment.id == assignment_id
            )
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_for_user(
        self,
        *,
        feature_rollout_id: int,
        user_id: int,
    ) -> UserAssignment | None:
        statement = select(UserAssignment).where(
            UserAssignment.feature_rollout_id
            == feature_rollout_id,
            UserAssignment.user_id == user_id,
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_by_rollout(
        self,
        feature_rollout_id: int,
    ) -> list[UserAssignment]:
        statement = (
            select(UserAssignment)
            .options(
                selectinload(
                    UserAssignment.user
                )
            )
            .where(
                UserAssignment.feature_rollout_id
                == feature_rollout_id
            )
            .order_by(
                UserAssignment.created_at.desc()
            )
        )

        return list(
            self.session.execute(
                statement
            ).scalars().all()
        )

    def count_by_rollout(
        self,
        feature_rollout_id: int,
        *,
        enabled_only: bool = False,
    ) -> int:
        statement = select(
            func.count(UserAssignment.id)
        ).where(
            UserAssignment.feature_rollout_id
            == feature_rollout_id
        )

        if enabled_only:
            statement = statement.where(
                UserAssignment.is_enabled.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one()

    def update(
        self,
        assignment: UserAssignment,
        *,
        is_enabled: bool,
    ) -> UserAssignment:
        assignment.is_enabled = is_enabled

        self.session.flush()
        self.session.refresh(assignment)

        return assignment

    def delete(
        self,
        assignment: UserAssignment,
    ) -> None:
        self.session.delete(assignment)
        self.session.flush()