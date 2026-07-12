"""
Notary Service for managing notary requests, digital stamps, certificates, QR code and ledger mapping.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
import logging
from datetime import datetime

from app.models.notary import NotaryRequest, NotaryStatus, NotaryCertificate
from app.models.document import Document, DocumentStatus
from app.schemas.notary import NotaryRequestCreate, NotaryRequestReview
from app.core.config import settings

logger = logging.getLogger(__name__)


class NotaryService:
    """Notary service handling requests lifecycle, seals and certification"""

    @staticmethod
    async def get_request_by_id(db: AsyncSession, request_id: UUID) -> Optional[NotaryRequest]:
        """Retrieve notary request by ID"""
        try:
            result = await db.execute(
                select(NotaryRequest).where(NotaryRequest.id == request_id, NotaryRequest.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting notary request by ID {request_id}: {str(e)}")
            return None

    @staticmethod
    async def list_pending_requests(db: AsyncSession) -> List[NotaryRequest]:
        """List all pending notary requests"""
        try:
            result = await db.execute(
                select(NotaryRequest).where(NotaryRequest.status == NotaryStatus.PENDING)
            )
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error listing pending requests: {str(e)}")
            return []

    @staticmethod
    async def create_request(
        db: AsyncSession,
        user_id: UUID,
        company_id: Optional[UUID],
        req_in: NotaryRequestCreate
    ) -> NotaryRequest:
        """Create new notary request mapping to uploaded document"""
        try:
            request = NotaryRequest(
                requested_by=user_id,
                company_id=company_id,
                document_id=req_in.document_id,
                request_number=f"NC-REQ-{uuid4().hex[:8].upper()}",
                request_type=req_in.request_type,
                status=NotaryStatus.PENDING,
                priority=req_in.priority,
                video_verification_required=req_in.video_verification_required,
                supporting_documents=req_in.supporting_documents
            )
            db.add(request)
            
            # Update Document status
            result = await db.execute(
                select(Document).where(Document.id == req_in.document_id)
            )
            doc = result.scalar_one_or_none()
            if doc:
                doc.status = DocumentStatus.PENDING_NOTARY
                
            await db.commit()
            await db.refresh(request)
            return request
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating notary request: {str(e)}")
            raise

    @staticmethod
    async def review_request(
        db: AsyncSession,
        request_id: UUID,
        notary_id: UUID,
        review: NotaryRequestReview
    ) -> Optional[NotaryRequest]:
        """Approve or reject a notary request"""
        try:
            request = await NotaryService.get_request_by_id(db, request_id)
            if not request:
                return None
            
            request.notary_id = notary_id
            request.status = review.status
            request.notary_notes = review.notary_notes
            request.internal_notes = review.internal_notes
            request.reviewed_at = datetime.utcnow()
            
            # Get associated document
            result = await db.execute(
                select(Document).where(Document.id == request.document_id)
            )
            doc = result.scalar_one_or_none()
            
            if review.status == NotaryStatus.APPROVED:
                request.approved_at = datetime.utcnow()
                request.notary_seal_applied = True
                request.notary_seal_timestamp = datetime.utcnow()
                
                if doc:
                    doc.status = DocumentStatus.NOTARIZED
                    doc.notarized_at = datetime.utcnow()
                    doc.has_watermark = True
                    doc.watermark_text = "NOTARYCHAIN VERIFIED COPY"
                    
                # Generate certificate
                cert = await NotaryService.generate_certificate(db, request, doc, notary_id)
                request.certificate_id = cert.id
                request.certificate_issued_at = cert.issued_at
                
            elif review.status == NotaryStatus.REJECTED:
                request.rejected_at = datetime.utcnow()
                request.rejection_reason = review.rejection_reason
                if doc:
                    doc.status = DocumentStatus.REJECTED
                    
            await db.commit()
            await db.refresh(request)
            return request
        except Exception as e:
            await db.rollback()
            logger.error(f"Error reviewing notary request {request_id}: {str(e)}")
            raise

    @staticmethod
    async def generate_certificate(
        db: AsyncSession,
        request: NotaryRequest,
        doc: Document,
        notary_id: UUID
    ) -> NotaryCertificate:
        """Create certificate details with signatures, seals, QR verification & blockchain hash simulation"""
        cert_number = f"NC-CERT-{uuid4().hex[:8].upper()}"
        verification_url = f"https://notarychain.io/verify/{cert_number}"
        
        cert = NotaryCertificate(
            notary_request_id=request.id,
            document_id=request.document_id,
            notary_id=notary_id,
            issued_to=request.requested_by,
            certificate_number=cert_number,
            certificate_type="notarization",
            certificate_text=f"Digital notarization cert for document {doc.document_name} ({doc.document_number}). Sealed by Notary ID {notary_id}.",
            certificate_pdf_url=f"http://s3.notarychain.io/certificates/{cert_number}.pdf",
            digital_signature=f"sha256Signature-{uuid4().hex}",
            signature_algorithm="RSASSA-PSS",
            public_key="pemFormatPublicKeyDummy",
            qr_code_url=f"http://s3.notarychain.io/qr/{cert_number}.png",
            qr_code_data=f"NotaryChain Cert:{cert_number} | Doc:{doc.file_hash}",
            verification_url=verification_url,
            blockchain_hash=f"0x{uuid4().hex}{uuid4().hex[:32]}",
            blockchain_verified=True,
            expires_at=datetime.utcnow()
        )
        db.add(cert)
        return cert
