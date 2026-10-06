from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.environment import Environment


class EnvironmentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        name: str,
        description: str | None = None,
    ) -> Environment:
        environment = Environment(
            name=name,
            description=description,
            is_active=True,
        )

        self.session.add(environment)
        self.session.flush()
        self.session.refresh(environment)

        return environment

    def get_by_id(
        self,
        environment_id: int,
        *,
        include_inactive: bool = False,
    ) -> Environment | None:
        statement = select(Environment).where(
            Environment.id == environment_id,
            Environment.deleted_at.is_(None),
        )

        if not include_inactive:
            statement = statement.where(
                Environment.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_name(
        self,
        name: str,
        *,
        include_inactive: bool = False,
    ) -> Environment | None:
        statement = select(Environment).where(
            func.lower(Environment.name) == name.lower(),
            Environment.deleted_at.is_(None),
        )

        if not include_inactive:
            statement = statement.where(
                Environment.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_environments(
        self,
        *,
        page: int,
        page_size: int,
        include_inactive: bool = False,
    ) -> tuple[list[Environment], int]:
        filters = [
            Environment.deleted_at.is_(None),
        ]

        if not include_inactive:
            filters.append(
                Environment.is_active.is_(True)
            )

        statement = (
            select(Environment)
            .where(*filters)
            .order_by(Environment.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_statement = (
            select(func.count(Environment.id))
            .where(*filters)
        )

        environments = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        return environments, total

    def update(
        self,
        environment: Environment,
        *,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> Environment:
        if name is not None:
            environment.name = name

        if description is not None:
            environment.description = description

        if is_active is not None:
            environment.is_active = is_active

        self.session.flush()
        self.session.refresh(environment)

        return environment