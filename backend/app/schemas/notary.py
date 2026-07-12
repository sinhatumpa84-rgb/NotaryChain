"""
Notary Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.notary import NotaryStatus


class NotaryRequestBase(BaseModel):
    request_type: str
    priority: Optional[str] = "normal"
    video_verification_required: Optional[bool] = False


class NotaryRequestCreate(NotaryRequestBase):
    document_id: UUID
    supporting_documents: Optional[List[UUID]] = []


class NotaryRequestReview(BaseModel):
    status: NotaryStatus
    notary_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class NotaryRequestResponse(NotaryRequestBase):
    id: UUID
    requested_by: UUID
    company_id: Optional[UUID] = None
    notary_id: Optional[UUID] = None
    document_id: UUID
    request_number: str
    status: NotaryStatus
    
    identity_verified: bool
    face_match_score: Optional[float] = None
    liveness_check_passed: bool
    liveness_check_score: Optional[float] = None
    
    video_call_url: Optional[str] = None
    video_recording_url: Optional[str] = None
    video_verification_at: Optional[datetime] = None
    
    supporting_documents: List[UUID] = []
    
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    notary_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    
    notary_seal_applied: bool
    notary_seal_url: Optional[str] = None
    notary_seal_timestamp: Optional[datetime] = None
    
    certificate_id: Optional[UUID] = None
    certificate_issued_at: Optional[datetime] = None
    
    sent_to_bank: bool
    bank_id: Optional[UUID] = None
    sent_to_bank_at: Optional[datetime] = None
    
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotaryCertificateResponse(BaseModel):
    id: UUID
    notary_request_id: UUID
    document_id: UUID
    notary_id: UUID
    issued_to: UUID
    
    certificate_number: str
    certificate_type: str
    certificate_text: str
    certificate_pdf_url: str
    
    digital_signature: str
    signature_algorithm: str
    public_key: str
    
    qr_code_url: str
    qr_code_data: str
    verification_url: str
    
    blockchain_hash: Optional[str] = None
    blockchain_verified: bool
    
    issued_at: datetime
    expires_at: Optional[datetime] = None
    is_revoked: bool

    class Config:
        from_attributes = True
