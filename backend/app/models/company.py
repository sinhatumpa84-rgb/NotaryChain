"""
Company model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Company(Base):
    """Company model"""
    __tablename__ = "companies"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic Info
    company_name = Column(String(255), nullable=False, index=True)
    company_type = Column(String(100), nullable=False)  # LLC, Corporation, etc.
    registration_number = Column(String(100), unique=True, nullable=False)
    tax_id = Column(String(50), nullable=True)
    
    # Address
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False, default="India")
    
    # Contact
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    website = Column(String(255), nullable=True)
    
    # Directors
    directors = Column(JSONB, nullable=True, default=[])  # List of director details
    
    # Legal Documents
    incorporation_certificate_url = Column(String(500), nullable=True)
    tax_certificate_url = Column(String(500), nullable=True)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Company {self.company_name}>"


class CompanyDocument(Base):
    """Company legal documents"""
    __tablename__ = "company_documents"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Document Info
    document_type = Column(String(100), nullable=False)  # incorporation, tax, financial, etc.
    document_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False)  # SHA256 hash
    file_size = Column(String(20), nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # Metadata
    metadata = Column(JSONB, nullable=True, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CompanyDocument {self.document_name}>"
