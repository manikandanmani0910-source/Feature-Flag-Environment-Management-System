from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
    )
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(
        min_length=1,
    )


class UserSessionResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)