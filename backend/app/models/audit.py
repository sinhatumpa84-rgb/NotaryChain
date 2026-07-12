"""
Audit log model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class AuditAction(str, enum.Enum):
    """Audit action types"""
    # Authentication
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_LOGIN_FAILED = "user_login_failed"
    PASSWORD_CHANGED = "password_changed"
    MFA_ENABLED = "mfa_enabled"
    MFA_DISABLED = "mfa_disabled"
    
    # User Management
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_SUSPENDED = "user_suspended"
    USER_ACTIVATED = "user_activated"
    
    # Document Operations
    DOCUMENT_UPLOADED = "document_uploaded"
    DOCUMENT_VIEWED = "document_viewed"
    DOCUMENT_DOWNLOADED = "document_downloaded"
    DOCUMENT_DELETED = "document_deleted"
    DOCUMENT_SHARED = "document_shared"
    DOCUMENT_ENCRYPTED = "document_encrypted"
    DOCUMENT_SIGNED = "document_signed"
    
    # Notary Operations
    NOTARY_REQUEST_CREATED = "notary_request_created"
    NOTARY_REQUEST_APPROVED = "notary_request_approved"
    NOTARY_REQUEST_REJECTED = "notary_request_rejected"
    NOTARY_SEAL_APPLIED = "notary_seal_applied"
    CERTIFICATE_ISSUED = "certificate_issued"
    CERTIFICATE_REVOKED = "certificate_revoked"
    
    # Fraud Detection
    FRAUD_DETECTED = "fraud_detected"
    FRAUD_CHECK_PASSED = "fraud_check_passed"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    
    # Bank Operations
    DOCUMENT_SENT_TO_BANK = "document_sent_to_bank"
    DOCUMENT_VERIFIED_BY_BANK = "document_verified_by_bank"
    LOAN_APPROVED = "loan_approved"
    LOAN_REJECTED = "loan_rejected"
    
    # System
    SYSTEM_ERROR = "system_error"
    SECURITY_ALERT = "security_alert"
    DATA_EXPORT = "data_export"
    COMPLIANCE_REPORT = "compliance_report"


class AuditLog(Base):
    """Audit log model - immutable record of all system actions"""
    __tablename__ = "audit_logs"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Action Details
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    action_description = Column(String(500), nullable=False)
    resource_type = Column(String(100), nullable=True)  # user, document, notary_request, etc.
    resource_id = Column(String(255), nullable=True, index=True)
    
    # User Information
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)
    user_role = Column(String(50), nullable=True)
    
    # Request Information
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    request_method = Column(String(10), nullable=True)
    request_path = Column(String(500), nullable=True)
    request_id = Column(String(100), nullable=True)
    
    # Device Information
    device_fingerprint = Column(String(64), nullable=True)
    device_type = Column(String(50), nullable=True)
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    
    # Location
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)
    
    # Status
    status = Column(String(20), nullable=False)  # success, failure, warning
    status_code = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Changes (for update operations)
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)
    
    # Additional Data
    metadata = Column(JSONB, nullable=True, default={})
    
    # Blockchain (optional - for critical actions)
    blockchain_hash = Column(String(66), nullable=True)
    blockchain_verified = Column(Boolean, default=False)
    
    # Duration
    duration_ms = Column(Integer, nullable=True)  # Request duration
    
    # Timestamp (immutable)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user_email} at {self.created_at}>"
    
    @property
    def is_success(self) -> bool:
        """Check if action was successful"""
        return self.status == "success"
    
    @property
    def is_security_event(self) -> bool:
        """Check if this is a security-related event"""
        security_actions = [
            AuditAction.USER_LOGIN_FAILED,
            AuditAction.FRAUD_DETECTED,
            AuditAction.SUSPICIOUS_ACTIVITY,
            AuditAction.SECURITY_ALERT,
        ]
        return self.action in security_actions
