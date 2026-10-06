from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


class UserBase(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
        pattern=r"^[a-zA-Z0-9_.-]+$",
    )
    email: EmailStr
    first_name: str = Field(
        min_length=1,
        max_length=100,
    )
    last_name: str = Field(
        min_length=1,
        max_length=100,
    )


class UserCreate(UserBase):
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    role_id: int = Field(
        gt=0,
    )


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    role_id: int | None = Field(
        default=None,
        gt=0,
    )
    is_active: bool | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(
        min_length=8,
        max_length=128,
    )
    new_password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(UserBase):
    id: int
    role_id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )