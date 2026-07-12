"""
API dependencies for authentication and authorization
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.firebase_service import firebase_service
from app.services.user_service import user_service
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from Firebase ID token
    
    Args:
        credentials: HTTP Authorization credentials (Bearer token)
        db: Database session
        
    Returns:
        User object from database
        
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    
    # Verify Firebase ID token
    firebase_user = await firebase_service.verify_id_token(token)
    uid = firebase_user.get("uid")
    
    if not uid:
        logger.error("No uid in Firebase token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await user_service.get_user_by_firebase_uid(db, uid)
    
    if not user:
        logger.error(f"User not found in database for Firebase uid: {uid}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first.",
        )
    
    if not user.is_active:
        logger.error(f"Inactive user attempted to access: {uid}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    
    logger.info(f"Authenticated user: {user.email} (id={user.id}, uid={uid})")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get current active user
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User object if active
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


async def get_current_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to get current verified user (email verified)
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User object if email verified
        
    Raises:
        HTTPException: If email not verified
    """
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user


def require_role(*allowed_roles: str):
    """
    Dependency factory to require specific user roles
    
    Args:
        allowed_roles: Allowed role names
        
    Returns:
        Dependency function
        
    Usage:
        @app.get("/admin", dependencies=[Depends(require_role("admin"))])
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"User {current_user.email} with role {current_user.role} "
                f"attempted to access resource requiring roles: {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Dependency to optionally get current user (doesn't raise error if not authenticated)
    
    Args:
        credentials: Optional HTTP Authorization credentials
        db: Database session
        
    Returns:
        User object if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        firebase_user = await firebase_service.verify_id_token(token)
        uid = firebase_user.get("uid")
        
        if uid:
            user = await user_service.get_user_by_firebase_uid(db, uid)
            return user if user and user.is_active else None
    
    except Exception as e:
        logger.debug(f"Optional auth failed: {str(e)}")
        return None
    
    return None
