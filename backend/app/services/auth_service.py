"""
Authentication service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Request
from datetime import timedelta
from typing import Optional, Tuple
import pyotp
import secrets
import qrcode
import io
import base64
import logging

from app.models.user import User
from app.core.security import SecurityUtils, get_client_ip, get_device_fingerprint
from app.services.user_service import UserService
from app.services.redis_service import redis_service
from app.core.config import settings

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service"""
    
    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str,
        mfa_code: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Tuple[User, str, str]:
        """
        Authenticate user and return access/refresh tokens
        Returns: (user, access_token, refresh_token)
        """
        # Get user
        user = await UserService.get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        # Check failed login attempts
        if user.failed_login_attempts and user.failed_login_attempts >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account temporarily locked due to multiple failed login attempts"
            )
        
        # Verify password
        if not SecurityUtils.verify_password(password, user.password_hash):
            # Increment failed login attempts
            await UserService.increment_failed_login(db, user.id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check MFA if enabled
        if user.mfa_enabled:
            if not mfa_code:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="MFA code required"
                )
            
            if not AuthService.verify_mfa_code(user.mfa_secret, mfa_code):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid MFA code"
                )
        
        # Reset failed login attempts
        await UserService.reset_failed_login(db, user.id)
        
        # Update last login
        if request:
            ip_address = get_client_ip(request)
            device_fp = get_device_fingerprint(request)
            # Store in Redis for session tracking
            await redis_service.set(
                f"session:{user.id}",
                {"ip": ip_address, "device": device_fp},
                expire=settings.SESSION_EXPIRY_HOURS * 3600
            )
        
        # Generate tokens
        access_token = SecurityUtils.create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        refresh_token = SecurityUtils.create_refresh_token(
            data={"sub": str(user.id)}
        )
        
        # Store refresh token in Redis
        await redis_service.set(
            f"refresh_token:{user.id}",
            refresh_token,
            expire=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        )
        
        logger.info(f"User authenticated: {user.email}")
        return user, access_token, refresh_token
    
    @staticmethod
    async def refresh_access_token(
        db: AsyncSession,
        refresh_token: str
    ) -> Tuple[str, str]:
        """
        Refresh access token using refresh token
        Returns: (new_access_token, new_refresh_token)
        """
        try:
            # Decode refresh token
            payload = SecurityUtils.decode_token(refresh_token)
            
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            # Check if refresh token exists in Redis
            stored_token = await redis_service.get(f"refresh_token:{user_id}")
            if not stored_token or stored_token != refresh_token:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired refresh token"
                )
            
            # Get user
            user = await UserService.get_user_by_id(db, user_id)
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )
            
            # Generate new tokens
            new_access_token = SecurityUtils.create_access_token(
                data={"sub": str(user.id), "email": user.email, "role": user.role.value}
            )
            new_refresh_token = SecurityUtils.create_refresh_token(
                data={"sub": str(user.id)}
            )
            
            # Update refresh token in Redis
            await redis_service.set(
                f"refresh_token:{user.id}",
                new_refresh_token,
                expire=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
            )
            
            return new_access_token, new_refresh_token
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    @staticmethod
    async def logout(user_id: str):
        """Logout user by removing tokens"""
        try:
            # Remove refresh token
            await redis_service.delete(f"refresh_token:{user_id}")
            # Remove session
            await redis_service.delete(f"session:{user_id}")
            logger.info(f"User logged out: {user_id}")
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
    
    @staticmethod
    async def send_verification_email(user: User):
        """Send email verification"""
        # Generate verification token
        token = SecurityUtils.generate_secure_token()
        
        # Store token in Redis (expires in 24 hours)
        await redis_service.set(
            f"email_verification:{token}",
            str(user.id),
            expire=24 * 3600
        )
        
        # TODO: Send email via email service (will be implemented in task #9)
        logger.info(f"Email verification token generated for: {user.email}")
        return token
    
    @staticmethod
    async def verify_email_token(db: AsyncSession, token: str) -> bool:
        """Verify email verification token"""
        try:
            # Get user ID from Redis
            user_id = await redis_service.get(f"email_verification:{token}")
            if not user_id:
                return False
            
            # Verify email
            success = await UserService.verify_email(db, user_id)
            
            # Delete token
            await redis_service.delete(f"email_verification:{token}")
            
            return success
        except Exception as e:
            logger.error(f"Error verifying email token: {str(e)}")
            return False
    
    @staticmethod
    async def send_phone_otp(phone: str) -> str:
        """Send phone OTP"""
        # Generate OTP
        otp = SecurityUtils.generate_otp()
        
        # Store OTP in Redis (expires in 10 minutes)
        await redis_service.set(
            f"phone_otp:{phone}",
            otp,
            expire=10 * 60
        )
        
        # TODO: Send SMS via SMS service (will be implemented in task #9)
        logger.info(f"Phone OTP generated for: {phone}")
        return otp
    
    @staticmethod
    async def verify_phone_otp(db: AsyncSession, phone: str, otp: str) -> bool:
        """Verify phone OTP"""
        try:
            # Get stored OTP
            stored_otp = await redis_service.get(f"phone_otp:{phone}")
            if not stored_otp or stored_otp != otp:
                return False
            
            # Get user and verify phone
            user = await UserService.get_user_by_phone(db, phone)
            if not user:
                return False
            
            success = await UserService.verify_phone(db, user.id)
            
            # Delete OTP
            await redis_service.delete(f"phone_otp:{phone}")
            
            return success
        except Exception as e:
            logger.error(f"Error verifying phone OTP: {str(e)}")
            return False
    
    @staticmethod
    def generate_mfa_secret() -> str:
        """Generate MFA secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_mfa_qr_code(user_email: str, mfa_secret: str) -> str:
        """Generate MFA QR code"""
        # Create TOTP URI
        totp = pyotp.TOTP(mfa_secret)
        uri = totp.provisioning_uri(
            name=user_email,
            issuer_name=settings.APP_NAME
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def verify_mfa_code(mfa_secret: str, code: str) -> bool:
        """Verify MFA code"""
        try:
            totp = pyotp.TOTP(mfa_secret)
            return totp.verify(code, valid_window=1)
        except Exception as e:
            logger.error(f"Error verifying MFA code: {str(e)}")
            return False
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> list[str]:
        """Generate backup codes for MFA"""
        return [secrets.token_hex(4).upper() for _ in range(count)]
    
    @staticmethod
    async def send_password_reset_email(user: User) -> str:
        """Send password reset email"""
        # Generate reset token
        token = SecurityUtils.generate_secure_token()
        
        # Store token in Redis (expires in 1 hour)
        await redis_service.set(
            f"password_reset:{token}",
            str(user.id),
            expire=3600
        )
        
        # TODO: Send email via email service (will be implemented in task #9)
        logger.info(f"Password reset token generated for: {user.email}")
        return token
    
    @staticmethod
    async def reset_password(
        db: AsyncSession,
        token: str,
        new_password: str
    ) -> bool:
        """Reset password using token"""
        try:
            # Get user ID from Redis
            user_id = await redis_service.get(f"password_reset:{token}")
            if not user_id:
                return False
            
            # Update password
            success = await UserService.update_password(db, user_id, new_password)
            
            # Delete token
            await redis_service.delete(f"password_reset:{token}")
            
            return success
        except Exception as e:
            logger.error(f"Error resetting password: {str(e)}")
            return False
