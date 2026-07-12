"""
Authentication request/response schemas
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    """User registration request"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: UserRole = Field(default=UserRole.COMPANY)
    
    @validator("password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@company.com",
                "password": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "phone": "+1234567890",
                "role": "company"
            }
        }


class UserLoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str
    mfa_code: Optional[str] = Field(None, min_length=6, max_length=6)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@company.com",
                "password": "SecurePass123!",
                "mfa_code": "123456"
            }
        }


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    """Email verification request"""
    token: str


class VerifyPhoneRequest(BaseModel):
    """Phone verification request"""
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    """Password reset request"""
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator("new_password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class EnableMFARequest(BaseModel):
    """Enable MFA request"""
    password: str


class EnableMFAResponse(BaseModel):
    """Enable MFA response"""
    mfa_secret: str
    qr_code_url: str
    backup_codes: list[str]


class VerifyMFARequest(BaseModel):
    """Verify MFA code request"""
    code: str = Field(..., min_length=6, max_length=6)


class OAuthCallbackRequest(BaseModel):
    """OAuth callback request"""
    code: str
    state: Optional[str] = None


class FirebaseSyncRequest(BaseModel):
    """Firebase user sync request"""
    firebase_uid: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    role: str = "company"
    photo_url: Optional[str] = None
    email_verified: bool = False
