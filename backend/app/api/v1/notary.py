"""
Notary API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.notary import NotaryRequestCreate, NotaryRequestReview, NotaryRequestResponse, NotaryCertificateResponse
from app.services.notary_service import NotaryService
from app.models.notary import NotaryStatus

router = APIRouter()


@router.post("/requests", response_model=NotaryRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_notary_request(
    req_in: NotaryRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Submit a new document notarization or eKYC request"""
    user_id = UUID(current_user["sub"])
    company_id = UUID(current_user.get("company_id")) if current_user.get("company_id") else None
    return await NotaryService.create_request(db, user_id, company_id, req_in)


@router.get("/requests", response_model=List[NotaryRequestResponse])
async def list_pending_requests(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all pending notarization requests in queue"""
    # Only notary and admins can view queue
    if current_user.get("role") not in ["notary", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to notary queue"
        )
    return await NotaryService.list_pending_requests(db)


@router.get("/requests/{request_id}", response_model=NotaryRequestResponse)
async def get_request_details(
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve full verification details of a specific request"""
    req = await NotaryService.get_request_by_id(db, request_id)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    return req


@router.put("/requests/{request_id}/approve", response_model=NotaryRequestResponse)
async def approve_notary_request(
    request_id: UUID,
    review: NotaryRequestReview,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Apply stamp approval, digital signature & generate verification certificate"""
    user_id = UUID(current_user["sub"])
    if current_user.get("role") not in ["notary", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only licensed notary officers can stamp approvals"
        )
    
    review.status = NotaryStatus.APPROVED
    req = await NotaryService.review_request(db, request_id, user_id, review)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    return req


@router.put("/requests/{request_id}/reject", response_model=NotaryRequestResponse)
async def reject_notary_request(
    request_id: UUID,
    review: NotaryRequestReview,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Flag request as suspicious / reject due to verification failures"""
    user_id = UUID(current_user["sub"])
    if current_user.get("role") not in ["notary", "admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )
    
    review.status = NotaryStatus.REJECTED
    req = await NotaryService.review_request(db, request_id, user_id, review)
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    return req
