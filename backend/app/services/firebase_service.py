"""
Firebase Admin SDK Service for token verification
"""
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global _app
    
    if _app is not None:
        logger.debug("[Firebase] Admin SDK already initialized")
        return _app
    
    try:
        # Initialize with service account credentials or default credentials
        if settings.FIREBASE_SERVICE_ACCOUNT_PATH:
            import os
            service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
            if os.path.exists(service_account_path):
                logger.info(f"[Firebase] Using service account from: {service_account_path}")
                cred = credentials.Certificate(service_account_path)
                _app = firebase_admin.initialize_app(cred)
            else:
                logger.warning(f"[Firebase] Service account file not found: {service_account_path}")
                logger.info("[Firebase] Attempting to initialize with project default credentials")
                _app = firebase_admin.initialize_app()
        else:
            # Initialize with default credentials (for Google Cloud deployment)
            logger.info("[Firebase] Initializing with default credentials")
            _app = firebase_admin.initialize_app()
        
        if _app:
            logger.info("[Firebase] Admin SDK initialized successfully")
        return _app
    except Exception as e:
        logger.error(f"[Firebase] Failed to initialize Admin SDK: {str(e)}")
        logger.warning("[Firebase] Continuing without Firebase Admin - token verification will fail")
        return None


class FirebaseService:
    """Service for Firebase authentication operations"""
    
    def __init__(self):
        """Initialize Firebase service"""
        self.app = initialize_firebase()
    
    async def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token and return decoded claims
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict with user claims (uid, email, email_verified, etc.)
            
        Raises:
            HTTPException: If token is invalid or verification fails
        """
        if not id_token:
            logger.error("No Firebase token provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No authentication token provided",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            # Verify the ID token
            decoded_token = firebase_auth.verify_id_token(id_token)
            
            logger.info(f"Successfully verified token for user: {decoded_token.get('uid')}")
            
            return {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "email_verified": decoded_token.get("email_verified", False),
                "phone_number": decoded_token.get("phone_number"),
                "name": decoded_token.get("name"),
                "picture": decoded_token.get("picture"),
                "firebase": decoded_token,
            }
        
        except firebase_auth.InvalidIdTokenError as e:
            logger.error(f"Invalid Firebase token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        except firebase_auth.ExpiredIdTokenError as e:
            logger.error(f"Expired Firebase token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        except firebase_auth.RevokedIdTokenError as e:
            logger.error(f"Revoked Firebase token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        except firebase_auth.CertificateFetchError as e:
            logger.error(f"Certificate fetch error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service temporarily unavailable",
            )
        
        except Exception as e:
            logger.error(f"Unexpected error verifying Firebase token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    async def get_user(self, uid: str) -> Dict[str, Any]:
        """
        Get user record from Firebase
        
        Args:
            uid: Firebase user ID
            
        Returns:
            Dict with user information
        """
        try:
            user_record = firebase_auth.get_user(uid)
            
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "email_verified": user_record.email_verified,
                "phone_number": user_record.phone_number,
                "display_name": user_record.display_name,
                "photo_url": user_record.photo_url,
                "disabled": user_record.disabled,
                "metadata": {
                    "creation_timestamp": user_record.user_metadata.creation_timestamp,
                    "last_sign_in_timestamp": user_record.user_metadata.last_sign_in_timestamp,
                },
            }
        
        except firebase_auth.UserNotFoundError:
            logger.error(f"User not found: {uid}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user information",
            )
    
    async def revoke_refresh_tokens(self, uid: str):
        """
        Revoke all refresh tokens for a user
        
        Args:
            uid: Firebase user ID
        """
        try:
            firebase_auth.revoke_refresh_tokens(uid)
            logger.info(f"Revoked refresh tokens for user: {uid}")
        
        except Exception as e:
            logger.error(f"Error revoking refresh tokens: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to revoke refresh tokens",
            )
    
    async def set_custom_user_claims(self, uid: str, claims: Dict[str, Any]):
        """
        Set custom claims on a user (for role-based access control)
        
        Args:
            uid: Firebase user ID
            claims: Dictionary of custom claims
        """
        try:
            firebase_auth.set_custom_user_claims(uid, claims)
            logger.info(f"Set custom claims for user: {uid}")
        
        except Exception as e:
            logger.error(f"Error setting custom claims: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set custom user claims",
            )


# Singleton instance
firebase_service = FirebaseService()
