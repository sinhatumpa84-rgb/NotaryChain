"""
Company Service for managing organization registry, director list updates, and KYC file tracking.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from uuid import UUID
import logging

from app.models.company import Company, CompanyDocument
from app.schemas.company import CompanyCreate, CompanyUpdate

logger = logging.getLogger(__name__)


class CompanyService:
    """Company service handling database queries and updates"""

    @staticmethod
    async def get_company_by_id(db: AsyncSession, company_id: UUID) -> Optional[Company]:
        """Get company registry entry by ID"""
        try:
            result = await db.execute(
                select(Company).where(Company.id == company_id, Company.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting company by ID {company_id}: {str(e)}")
            return None

    @staticmethod
    async def get_companies_by_owner(db: AsyncSession, owner_id: UUID) -> List[Company]:
        """Get companies registered by user ID"""
        try:
            result = await db.execute(
                select(Company).where(Company.owner_id == owner_id, Company.deleted_at.is_(None))
            )
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error getting companies for owner {owner_id}: {str(e)}")
            return []

    @staticmethod
    async def register_company(
        db: AsyncSession,
        owner_id: UUID,
        comp_in: CompanyCreate
    ) -> Company:
        """Register a new corporate organization profile"""
        try:
            company = Company(
                owner_id=owner_id,
                company_name=comp_in.company_name,
                company_type=comp_in.company_type,
                registration_number=comp_in.registration_number,
                tax_id=comp_in.tax_id,
                address_line1=comp_in.address_line1,
                address_line2=comp_in.address_line2,
                city=comp_in.city,
                state=comp_in.state,
                postal_code=comp_in.postal_code,
                country=comp_in.country,
                email=comp_in.email,
                phone=comp_in.phone,
                website=comp_in.website,
                directors=comp_in.directors
            )
            db.add(company)
            await db.commit()
            await db.refresh(company)
            
            logger.info(f"Registered company: {company.company_name} by owner {owner_id}")
            return company
        except Exception as e:
            await db.rollback()
            logger.error(f"Error registering company: {str(e)}")
            raise

    @staticmethod
    async def update_company(
        db: AsyncSession,
        company_id: UUID,
        comp_in: CompanyUpdate
    ) -> Optional[Company]:
        """Update company profile data fields"""
        try:
            company = await CompanyService.get_company_by_id(db, company_id)
            if not company:
                return None
            
            update_data = comp_in.model_dump(exclude_unset=True)
            for key, val in update_data.items():
                setattr(company, key, val)
                
            await db.commit()
            await db.refresh(company)
            return company
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating company {company_id}: {str(e)}")
            raise

    @staticmethod
    async def get_documents_by_company(db: AsyncSession, company_id: UUID) -> List[CompanyDocument]:
        """Retrieve all company specific registration files"""
        try:
            result = await db.execute(
                select(CompanyDocument).where(
                    CompanyDocument.company_id == company_id,
                    CompanyDocument.deleted_at.is_(None)
                )
            )
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error getting documents for company {company_id}: {str(e)}")
            return []
