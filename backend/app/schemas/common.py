from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field


T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Request completed successfully."
    data: T | None = None


class PaginationParams(BaseModel):
    page: int = Field(
        default=1,
        ge=1,
        description="Page number starting from 1.",
    )
    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Number of records per page.",
    )


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    items: list[T]
    pagination: PaginationMeta