from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.user import User


class RoleRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        name: str,
        description: str | None = None,
    ) -> Role:
        role = Role(
            name=name,
            description=description,
            is_active=True,
        )

        self.session.add(role)
        self.session.flush()
        self.session.refresh(role)

        return role

    def get_by_id(
        self,
        role_id: int,
        *,
        include_inactive: bool = False,
    ) -> Role | None:
        statement = select(Role).where(Role.id == role_id)

        if not include_inactive:
            statement = statement.where(
                Role.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_name(
        self,
        name: str,
        *,
        include_inactive: bool = False,
    ) -> Role | None:
        statement = select(Role).where(
            func.lower(Role.name) == name.lower()
        )

        if not include_inactive:
            statement = statement.where(
                Role.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def list_roles(
        self,
        *,
        page: int,
        page_size: int,
        include_inactive: bool = False,
    ) -> tuple[list[Role], int]:
        filters = []

        if not include_inactive:
            filters.append(Role.is_active.is_(True))

        statement = (
            select(Role)
            .where(*filters)
            .order_by(Role.name.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_statement = select(
            func.count(Role.id)
        ).where(*filters)

        roles = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        return roles, total

    def update(
        self,
        role: Role,
        *,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> Role:
        if name is not None:
            role.name = name

        if description is not None:
            role.description = description

        if is_active is not None:
            role.is_active = is_active

        self.session.flush()
        self.session.refresh(role)

        return role

    def has_users(self, role_id: int) -> bool:
        statement = (
            select(func.count(User.id))
            .where(User.role_id == role_id)
            .where(User.deleted_at.is_(None))
        )

        return self.session.execute(
            statement
        ).scalar_one() > 0