"""
User request/response schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserResponse(BaseModel):
    """User response"""
    id: str
    email: str
    phone: Optional[str]
    first_name: str
    last_name: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str]
    is_email_verified: bool
    is_phone_verified: bool
    is_identity_verified: bool
    is_active: bool
    is_approved: bool
    mfa_enabled: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "john.doe@company.com",
                "phone": "+1234567890",
                "first_name": "John",
                "last_name": "Doe",
                "full_name": "John Doe",
                "role": "company",
                "avatar_url": None,
                "is_email_verified": True,
                "is_phone_verified": True,
                "is_identity_verified": False,
                "is_active": True,
                "is_approved": True,
                "mfa_enabled": False,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class UserUpdateRequest(BaseModel):
    """User update request"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None


class UserKYCRequest(BaseModel):
    """User KYC verification request"""
    aadhaar_number: Optional[str] = Field(None, min_length=12, max_length=12)
    pan_number: Optional[str] = Field(None, min_length=10, max_length=10)
    passport_number: Optional[str] = Field(None, max_length=20)
    document_front_url: str
    document_back_url: Optional[str] = None
    selfie_url: str


class UserListResponse(BaseModel):
    """User list response"""
    users: list[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
