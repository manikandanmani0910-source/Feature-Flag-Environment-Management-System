from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.user import User


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(
        self,
        *,
        username: str,
        email: str,
        password_hash: str,
        first_name: str,
        last_name: str,
        role_id: int,
        is_superuser: bool = False,
    ) -> User:
        user = User(
            username=username,
            email=email.lower(),
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role_id=role_id,
            is_active=True,
            is_superuser=is_superuser,
        )

        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)

        return user

    def get_by_id(
        self,
        user_id: int,
        *,
        include_inactive: bool = False,
    ) -> User | None:
        statement = (
            select(User)
            .options(selectinload(User.role))
            .where(
                User.id == user_id,
                User.deleted_at.is_(None),
            )
        )

        if not include_inactive:
            statement = statement.where(
                User.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_username(
        self,
        username: str,
        *,
        include_inactive: bool = False,
    ) -> User | None:
        statement = (
            select(User)
            .options(selectinload(User.role))
            .where(
                func.lower(User.username)
                == username.lower(),
                User.deleted_at.is_(None),
            )
        )

        if not include_inactive:
            statement = statement.where(
                User.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_by_email(
        self,
        email: str,
        *,
        include_inactive: bool = False,
    ) -> User | None:
        statement = (
            select(User)
            .options(selectinload(User.role))
            .where(
                func.lower(User.email)
                == email.lower(),
                User.deleted_at.is_(None),
            )
        )

        if not include_inactive:
            statement = statement.where(
                User.is_active.is_(True)
            )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def get_for_authentication(
        self,
        identifier: str,
    ) -> User | None:
        statement = (
            select(User)
            .options(selectinload(User.role))
            .where(
                User.deleted_at.is_(None),
                User.is_active.is_(True),
                or_(
                    func.lower(User.username)
                    == identifier.lower(),
                    func.lower(User.email)
                    == identifier.lower(),
                ),
            )
        )

        return self.session.execute(
            statement
        ).scalar_one_or_none()

    def exists_by_username(
        self,
        username: str,
    ) -> bool:
        statement = select(
            select(User.id)
            .where(
                func.lower(User.username)
                == username.lower(),
                User.deleted_at.is_(None),
            )
            .exists()
        )

        return bool(
            self.session.execute(statement).scalar()
        )

    def exists_by_email(
        self,
        email: str,
    ) -> bool:
        statement = select(
            select(User.id)
            .where(
                func.lower(User.email)
                == email.lower(),
                User.deleted_at.is_(None),
            )
            .exists()
        )

        return bool(
            self.session.execute(statement).scalar()
        )

    def list_users(
        self,
        *,
        page: int,
        page_size: int,
        role_id: int | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> tuple[list[User], int]:
        filters = [
            User.deleted_at.is_(None),
        ]

        if role_id is not None:
            filters.append(
                User.role_id == role_id
            )

        if is_active is not None:
            filters.append(
                User.is_active == is_active
            )

        if search:
            pattern = f"%{search.strip().lower()}%"

            filters.append(
                or_(
                    func.lower(User.username).like(pattern),
                    func.lower(User.email).like(pattern),
                    func.lower(User.first_name).like(pattern),
                    func.lower(User.last_name).like(pattern),
                )
            )

        statement = (
            select(User)
            .options(selectinload(User.role))
            .where(*filters)
            .order_by(
                User.created_at.desc(),
                User.id.desc(),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_statement = (
            select(func.count(User.id))
            .where(*filters)
        )

        users = list(
            self.session.execute(
                statement
            ).scalars().all()
        )

        total = self.session.execute(
            count_statement
        ).scalar_one()

        return users, total

    def update(
        self,
        user: User,
        *,
        email: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        role_id: int | None = None,
        is_active: bool | None = None,
    ) -> User:
        if email is not None:
            user.email = email.lower()

        if first_name is not None:
            user.first_name = first_name

        if last_name is not None:
            user.last_name = last_name

        if role_id is not None:
            user.role_id = role_id

        if is_active is not None:
            user.is_active = is_active

        self.session.flush()
        self.session.refresh(user)

        return user

    def update_password(
        self,
        user: User,
        password_hash: str,
    ) -> User:
        user.password_hash = password_hash

        self.session.flush()
        self.session.refresh(user)

        return user

    def soft_delete(
        self,
        user: User,
    ) -> None:
        from sqlalchemy import func

        user.deleted_at = func.now()
        user.is_active = False

        self.session.flush()