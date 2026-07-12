"""
Document Pydantic schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.document import DocumentType, DocumentStatus


class DocumentBase(BaseModel):
    document_type: DocumentType
    document_name: str
    document_number: str


class DocumentCreate(DocumentBase):
    original_filename: str
    file_size: int
    mime_type: str
    file_extension: str
    file_hash: str


class DocumentUpdate(BaseModel):
    document_name: Optional[str] = None
    status: Optional[DocumentStatus] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DocumentResponse(DocumentBase):
    id: UUID
    uploaded_by: UUID
    company_id: Optional[UUID] = None
    notary_request_id: Optional[UUID] = None
    
    original_filename: str
    file_url: str
    encrypted_file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_size: int
    mime_type: str
    file_extension: str
    
    file_hash: str
    blockchain_hash: Optional[str] = None
    is_encrypted: bool
    status: DocumentStatus
    
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    ocr_completed_at: Optional[datetime] = None
    extracted_data: Optional[Dict[str, Any]] = None
    
    fraud_score: Optional[float] = None
    fraud_flags: Optional[List[str]] = None
    fraud_check_completed_at: Optional[datetime] = None
    is_tampered: bool
    tampering_details: Optional[Dict[str, Any]] = None
    
    ai_summary: Optional[str] = None
    ai_risk_assessment: Optional[str] = None
    ai_recommendations: Optional[Dict[str, Any]] = None
    
    is_signed: bool
    signed_at: Optional[datetime] = None
    signed_by: Optional[UUID] = None
    
    qr_code_url: Optional[str] = None
    version: int
    tags: List[str] = []
    
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    notarized_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentSignRequest(BaseModel):
    signature_data: Dict[str, Any]
    signature_certificate: str


class DocumentVerifyResponse(BaseModel):
    is_valid: bool
    document_id: UUID
    document_number: str
    file_hash: str
    blockchain_hash: Optional[str] = None
    is_signed: bool
    signed_at: Optional[datetime] = None
    notary_seal_applied: bool
    seal_timestamp: Optional[datetime] = None
    notary_name: Optional[str] = None
    verification_details: Dict[str, Any]
