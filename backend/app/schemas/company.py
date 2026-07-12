"""
Company Pydantic schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class CompanyBase(BaseModel):
    company_name: str
    company_type: str
    registration_number: str
    tax_id: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: Optional[str] = "India"
    email: EmailStr
    phone: str
    website: Optional[str] = None
    directors: Optional[List[Dict[str, Any]]] = []


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    directors: Optional[List[Dict[str, Any]]] = []


class CompanyResponse(CompanyBase):
    id: UUID
    owner_id: UUID
    incorporation_certificate_url: Optional[str] = None
    tax_certificate_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyDocumentResponse(BaseModel):
    id: UUID
    company_id: UUID
    uploaded_by: UUID
    document_type: str
    document_name: str
    file_url: str
    file_hash: str
    file_size: str
    mime_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
