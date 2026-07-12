"""
Common response schemas
"""
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, Any

T = TypeVar('T')


class APIResponse(BaseModel, Generic[T]):
    """Generic API response wrapper"""
    success: bool
    message: Optional[str] = None
    data: Optional[T] = None
    errors: Optional[list[str]] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response"""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    environment: str
    database: str = "unknown"
    redis: str = "unknown"


class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    message: str
    detail: Optional[Any] = None
    code: Optional[str] = None
