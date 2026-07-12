"""
User model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum
from datetime import datetime

from app.core.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    COMPANY = "company"
    NOTARY = "notary"
    BANK = "bank"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Firebase UID (for Firebase Authentication integration)
    firebase_uid = Column(String(128), unique=True, nullable=True, index=True)
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.COMPANY)
    avatar_url = Column(String(500), nullable=True)
    
    # Verification
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_identity_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)  # For notaries
    
    # KYC Data
    aadhaar_number = Column(String(12), nullable=True)
    pan_number = Column(String(10), nullable=True)
    passport_number = Column(String(20), nullable=True)
    face_encoding = Column(Text, nullable=True)  # Base64 encoded face embedding
    
    # Security
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(32), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    device_fingerprint = Column(Text, nullable=True)
    
    # OAuth
    google_id = Column(String(255), unique=True, nullable=True)
    microsoft_id = Column(String(255), unique=True, nullable=True)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # License Info (for notaries)
    notary_license_number = Column(String(50), nullable=True)
    notary_license_state = Column(String(50), nullable=True)
    notary_license_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Organization (for bank users)
    organization_name = Column(String(255), nullable=True)
    organization_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
    
    @property
    def full_name(self) -> str:
        """Get full name"""
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_verified(self) -> bool:
        """Check if user is fully verified"""
        return (
            self.is_email_verified and
            self.is_phone_verified and
            self.is_identity_verified
        )
