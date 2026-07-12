"""
Company management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyDocumentResponse
from app.services.company_service import CompanyService

router = APIRouter()


@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def register_company(
    comp_in: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Register a new company corporate profile"""
    user_id = UUID(current_user["sub"])
    return await CompanyService.register_company(db, user_id, comp_in)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve details for a specific company"""
    comp = await CompanyService.get_company_by_id(db, company_id)
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return comp


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    comp_in: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update registry information for a company"""
    comp = await CompanyService.update_company(db, company_id, comp_in)
    if not comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return comp


@router.get("/{company_id}/documents", response_model=List[CompanyDocumentResponse])
async def list_company_documents(
    company_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List legal corporate verification files associated with company"""
    return await CompanyService.get_documents_by_company(db, company_id)
