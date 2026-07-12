"""
User service for user management operations
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, List
from uuid import UUID
import logging

from app.models.user import User, UserRole
from app.schemas.user import UserUpdateRequest
from app.core.security import SecurityUtils

logger = logging.getLogger(__name__)


class UserService:
    """User service for database operations"""
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        try:
            result = await db.execute(
                select(User).where(User.id == user_id, User.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            result = await db.execute(
                select(User).where(User.email == email, User.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_by_firebase_uid(db: AsyncSession, firebase_uid: str) -> Optional[User]:
        """Get user by Firebase UID"""
        try:
            result = await db.execute(
                select(User).where(User.firebase_uid == firebase_uid, User.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by Firebase UID: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_by_phone(db: AsyncSession, phone: str) -> Optional[User]:
        """Get user by phone"""
        try:
            result = await db.execute(
                select(User).where(User.phone == phone, User.deleted_at.is_(None))
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user by phone: {str(e)}")
            return None
    
    @staticmethod
    async def create_user(
        db: AsyncSession,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: UserRole,
        phone: Optional[str] = None
    ) -> User:
        """Create a new user"""
        try:
            # Hash password
            password_hash = SecurityUtils.hash_password(password)
            
            # Create user
            user = User(
                email=email,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                role=role,
                phone=phone,
                is_active=True,
                is_approved=(role != UserRole.NOTARY)  # Notaries need approval
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"Created user: {user.email}")
            return user
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise
    
    @staticmethod
    async def update_user(
        db: AsyncSession,
        user_id: UUID,
        update_data: UserUpdateRequest
    ) -> Optional[User]:
        """Update user"""
        try:
            # Build update dict
            update_dict = update_data.model_dump(exclude_unset=True)
            
            if not update_dict:
                return await UserService.get_user_by_id(db, user_id)
            
            # Update user
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(**update_dict)
            )
            await db.commit()
            
            # Return updated user
            return await UserService.get_user_by_id(db, user_id)
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            return None
    
    @staticmethod
    async def verify_email(db: AsyncSession, user_id: UUID) -> bool:
        """Mark user email as verified"""
        try:
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(is_email_verified=True)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error verifying email: {str(e)}")
            return False
    
    @staticmethod
    async def verify_phone(db: AsyncSession, user_id: UUID) -> bool:
        """Mark user phone as verified"""
        try:
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(is_phone_verified=True)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error verifying phone: {str(e)}")
            return False
    
    @staticmethod
    async def update_password(
        db: AsyncSession,
        user_id: UUID,
        new_password: str
    ) -> bool:
        """Update user password"""
        try:
            password_hash = SecurityUtils.hash_password(new_password)
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(password_hash=password_hash)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating password: {str(e)}")
            return False
    
    @staticmethod
    async def enable_mfa(
        db: AsyncSession,
        user_id: UUID,
        mfa_secret: str
    ) -> bool:
        """Enable MFA for user"""
        try:
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(mfa_enabled=True, mfa_secret=mfa_secret)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error enabling MFA: {str(e)}")
            return False
    
    @staticmethod
    async def disable_mfa(db: AsyncSession, user_id: UUID) -> bool:
        """Disable MFA for user"""
        try:
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(mfa_enabled=False, mfa_secret=None)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error disabling MFA: {str(e)}")
            return False
    
    @staticmethod
    async def increment_failed_login(db: AsyncSession, user_id: UUID) -> int:
        """Increment failed login attempts"""
        try:
            user = await UserService.get_user_by_id(db, user_id)
            if user:
                new_count = (user.failed_login_attempts or 0) + 1
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(failed_login_attempts=new_count)
                )
                await db.commit()
                return new_count
            return 0
        except Exception as e:
            await db.rollback()
            logger.error(f"Error incrementing failed login: {str(e)}")
            return 0
    
    @staticmethod
    async def reset_failed_login(db: AsyncSession, user_id: UUID) -> bool:
        """Reset failed login attempts"""
        try:
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(failed_login_attempts=0)
            )
            await db.commit()
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error resetting failed login: {str(e)}")
            return False
    
    @staticmethod
    async def get_users(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        role: Optional[UserRole] = None
    ) -> List[User]:
        """Get list of users"""
        try:
            query = select(User).where(User.deleted_at.is_(None))
            
            if role:
                query = query.where(User.role == role)
            
            query = query.offset(skip).limit(limit)
            result = await db.execute(query)
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            return []
