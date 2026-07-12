"""
Notary models
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class NotaryStatus(str, enum.Enum):
    """Notary request status"""
    PENDING = "pending"
    IN_REVIEW = "in_review"
    VIDEO_VERIFICATION_SCHEDULED = "video_verification_scheduled"
    IDENTITY_VERIFIED = "identity_verified"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class NotaryRequest(Base):
    """Notary request model"""
    __tablename__ = "notary_requests"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    notary_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    
    # Request Info
    request_number = Column(String(100), unique=True, nullable=False, index=True)
    request_type = Column(String(50), nullable=False)  # document_notarization, identity_verification
    status = Column(SQLEnum(NotaryStatus), nullable=False, default=NotaryStatus.PENDING)
    priority = Column(String(20), default="normal")  # low, normal, high, urgent
    
    # Verification Details
    identity_verified = Column(Boolean, default=False)
    face_match_score = Column(Float, nullable=True)
    liveness_check_passed = Column(Boolean, default=False)
    liveness_check_score = Column(Float, nullable=True)
    
    # Video Verification
    video_verification_required = Column(Boolean, default=False)
    video_call_url = Column(String(500), nullable=True)
    video_recording_url = Column(String(500), nullable=True)
    video_verification_at = Column(DateTime(timezone=True), nullable=True)
    
    # Documents Submitted
    supporting_documents = Column(JSONB, nullable=True, default=[])  # List of document IDs
    
    # Notary Actions
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Notary Notes
    notary_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Digital Seal
    notary_seal_applied = Column(Boolean, default=False)
    notary_seal_url = Column(String(500), nullable=True)
    notary_seal_timestamp = Column(DateTime(timezone=True), nullable=True)
    
    # Certificate
    certificate_id = Column(UUID(as_uuid=True), ForeignKey("notary_certificates.id"), nullable=True)
    certificate_issued_at = Column(DateTime(timezone=True), nullable=True)
    
    # Bank Submission
    sent_to_bank = Column(Boolean, default=False)
    bank_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    sent_to_bank_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<NotaryRequest {self.request_number} - {self.status}>"


class NotaryCertificate(Base):
    """Notary certificate model"""
    __tablename__ = "notary_certificates"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    notary_request_id = Column(UUID(as_uuid=True), ForeignKey("notary_requests.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    notary_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    issued_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Certificate Info
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)
    certificate_type = Column(String(50), nullable=False)  # notarization, verification
    
    # Content
    certificate_text = Column(Text, nullable=False)
    certificate_pdf_url = Column(String(500), nullable=False)
    
    # Digital Signature
    digital_signature = Column(Text, nullable=False)
    signature_algorithm = Column(String(50), nullable=False)
    public_key = Column(Text, nullable=False)
    
    # QR Code
    qr_code_url = Column(String(500), nullable=False)
    qr_code_data = Column(Text, nullable=False)
    verification_url = Column(String(500), nullable=False)
    
    # Blockchain
    blockchain_hash = Column(String(66), nullable=True)
    blockchain_verified = Column(Boolean, default=False)
    
    # Validity
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revocation_reason = Column(Text, nullable=True)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<NotaryCertificate {self.certificate_number}>"
    
    @property
    def is_valid(self) -> bool:
        """Check if certificate is valid"""
        if self.is_revoked:
            return False
        if self.expires_at and self.expires_at < func.now():
            return False
        return True
