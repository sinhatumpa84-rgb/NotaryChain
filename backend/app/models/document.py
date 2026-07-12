"""
Document model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class DocumentType(str, enum.Enum):
    """Document type enumeration"""
    LOAN_APPLICATION = "loan_application"
    FINANCIAL_STATEMENT = "financial_statement"
    TAX_RETURN = "tax_return"
    BANK_STATEMENT = "bank_statement"
    IDENTITY_PROOF = "identity_proof"
    ADDRESS_PROOF = "address_proof"
    INCORPORATION_CERTIFICATE = "incorporation_certificate"
    BOARD_RESOLUTION = "board_resolution"
    POWER_OF_ATTORNEY = "power_of_attorney"
    AFFIDAVIT = "affidavit"
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    """Document status enumeration"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    OCR_COMPLETED = "ocr_completed"
    FRAUD_CHECK_PASSED = "fraud_check_passed"
    FRAUD_DETECTED = "fraud_detected"
    PENDING_NOTARY = "pending_notary"
    NOTARIZED = "notarized"
    REJECTED = "rejected"
    SENT_TO_BANK = "sent_to_bank"
    VERIFIED_BY_BANK = "verified_by_bank"
    ARCHIVED = "archived"


class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    notary_request_id = Column(UUID(as_uuid=True), ForeignKey("notary_requests.id"), nullable=True)
    
    # Document Info
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    document_name = Column(String(255), nullable=False)
    document_number = Column(String(100), unique=True, nullable=False, index=True)
    
    # File Info
    original_filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)  # S3 URL
    encrypted_file_url = Column(String(500), nullable=True)  # Encrypted version
    thumbnail_url = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(10), nullable=False)
    
    # Security
    file_hash = Column(String(64), nullable=False, unique=True)  # SHA256
    blockchain_hash = Column(String(66), nullable=True)  # Ethereum transaction hash
    encryption_key_id = Column(String(100), nullable=True)
    is_encrypted = Column(Boolean, default=False)
    
    # Watermark
    has_watermark = Column(Boolean, default=False)
    watermark_text = Column(String(255), nullable=True)
    
    # Status
    status = Column(SQLEnum(DocumentStatus), nullable=False, default=DocumentStatus.UPLOADED)
    
    # OCR Data
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    ocr_completed_at = Column(DateTime(timezone=True), nullable=True)
    extracted_data = Column(JSONB, nullable=True, default={})  # Structured data from OCR
    
    # Fraud Detection
    fraud_score = Column(Float, nullable=True)
    fraud_flags = Column(JSONB, nullable=True, default=[])
    fraud_check_completed_at = Column(DateTime(timezone=True), nullable=True)
    is_tampered = Column(Boolean, default=False)
    tampering_details = Column(JSONB, nullable=True)
    
    # AI Analysis
    ai_summary = Column(Text, nullable=True)
    ai_risk_assessment = Column(Text, nullable=True)
    ai_recommendations = Column(JSONB, nullable=True)
    
    # Digital Signature
    is_signed = Column(Boolean, default=False)
    signature_data = Column(JSONB, nullable=True)
    signature_certificate = Column(Text, nullable=True)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    signed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # QR Code
    qr_code_url = Column(String(500), nullable=True)
    qr_code_data = Column(Text, nullable=True)
    
    # Version Control
    version = Column(Integer, default=1)
    parent_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    tags = Column(JSONB, nullable=True, default=[])
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    notarized_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Document {self.document_number} - {self.document_name}>"
    
    @property
    def is_fraud_detected(self) -> bool:
        """Check if fraud was detected"""
        return self.fraud_score is not None and self.fraud_score > 0.7
