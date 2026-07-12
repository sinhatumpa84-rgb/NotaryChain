"""
Notification model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class NotificationType(str, enum.Enum):
    """Notification type enumeration"""
    # Document
    DOCUMENT_UPLOADED = "document_uploaded"
    DOCUMENT_PROCESSED = "document_processed"
    DOCUMENT_NOTARIZED = "document_notarized"
    DOCUMENT_REJECTED = "document_rejected"
    
    # Notary
    NOTARY_REQUEST_RECEIVED = "notary_request_received"
    NOTARY_REQUEST_APPROVED = "notary_request_approved"
    NOTARY_REQUEST_REJECTED = "notary_request_rejected"
    VIDEO_VERIFICATION_SCHEDULED = "video_verification_scheduled"
    
    # Fraud
    FRAUD_DETECTED = "fraud_detected"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    
    # Bank
    DOCUMENT_SENT_TO_BANK = "document_sent_to_bank"
    DOCUMENT_VERIFIED = "document_verified"
    LOAN_APPROVED = "loan_approved"
    LOAN_REJECTED = "loan_rejected"
    
    # Security
    LOGIN_ALERT = "login_alert"
    PASSWORD_CHANGED = "password_changed"
    MFA_ENABLED = "mfa_enabled"
    SUSPICIOUS_LOGIN = "suspicious_login"
    
    # System
    SYSTEM_MAINTENANCE = "system_maintenance"
    CERTIFICATE_EXPIRING = "certificate_expiring"
    COMPLIANCE_ALERT = "compliance_alert"


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification Details
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Delivery Channels
    sent_via_email = Column(Boolean, default=False)
    sent_via_sms = Column(Boolean, default=False)
    sent_via_whatsapp = Column(Boolean, default=False)
    sent_via_push = Column(Boolean, default=False)
    sent_via_in_app = Column(Boolean, default=True)
    
    # Related Resources
    resource_type = Column(String(100), nullable=True)  # document, notary_request, etc.
    resource_id = Column(String(255), nullable=True)
    action_url = Column(String(500), nullable=True)  # Deep link to resource
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Notification {self.type} to user {self.user_id}>"
    
    @property
    def is_expired(self) -> bool:
        """Check if notification has expired"""
        if self.expires_at:
            return self.expires_at < func.now()
        return False
