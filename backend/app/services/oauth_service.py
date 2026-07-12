"""
OAuth authentication service for Google and Microsoft
"""
from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status
import logging
from urllib.parse import urlencode

from app.core.config import settings

logger = logging.getLogger(__name__)


class OAuthService:
    """OAuth service for third-party authentication"""
    
    # Google OAuth endpoints
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    # Microsoft OAuth endpoints
    MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    MICROSOFT_USERINFO_URL = "https://graph.microsoft.com/v1.0/me"
    
    @staticmethod
    def get_google_auth_url(redirect_uri: str, state: Optional[str] = None) -> str:
        """
        Generate Google OAuth authorization URL
        
        Args:
            redirect_uri: Callback URL after authentication
            state: Optional state parameter for security
            
        Returns:
            Authorization URL
        """
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth not configured"
            )
        
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        
        if state:
            params["state"] = state
        
        return f"{OAuthService.GOOGLE_AUTH_URL}?{urlencode(params)}"
    
    @staticmethod
    async def get_google_user_info(code: str, redirect_uri: str) -> Dict[str, Any]:
        """
        Exchange authorization code for user information
        
        Args:
            code: Authorization code from Google
            redirect_uri: Redirect URI used in authorization
            
        Returns:
            User information dict with email, name, etc.
        """
        try:
            # Exchange code for access token
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    OAuthService.GOOGLE_TOKEN_URL,
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": redirect_uri,
                        "grant_type": "authorization_code",
                    }
                )
                
                if token_response.status_code != 200:
                    logger.error(f"Google token exchange failed: {token_response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to authenticate with Google"
                    )
                
                token_data = token_response.json()
                access_token = token_data.get("access_token")
                
                # Get user information
                user_response = await client.get(
                    OAuthService.GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if user_response.status_code != 200:
                    logger.error(f"Google userinfo failed: {user_response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to get user information from Google"
                    )
                
                user_data = user_response.json()
                
                return {
                    "email": user_data.get("email"),
                    "email_verified": user_data.get("verified_email", False),
                    "first_name": user_data.get("given_name", ""),
                    "last_name": user_data.get("family_name", ""),
                    "picture": user_data.get("picture"),
                    "google_id": user_data.get("id"),
                }
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during Google OAuth: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OAuth authentication failed"
            )
    
    @staticmethod
    def get_microsoft_auth_url(redirect_uri: str, state: Optional[str] = None) -> str:
        """
        Generate Microsoft OAuth authorization URL
        
        Args:
            redirect_uri: Callback URL after authentication
            state: Optional state parameter for security
            
        Returns:
            Authorization URL
        """
        if not settings.MICROSOFT_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Microsoft OAuth not configured"
            )
        
        params = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile User.Read",
            "response_mode": "query",
        }
        
        if state:
            params["state"] = state
        
        return f"{OAuthService.MICROSOFT_AUTH_URL}?{urlencode(params)}"
    
    @staticmethod
    async def get_microsoft_user_info(code: str, redirect_uri: str) -> Dict[str, Any]:
        """
        Exchange authorization code for user information
        
        Args:
            code: Authorization code from Microsoft
            redirect_uri: Redirect URI used in authorization
            
        Returns:
            User information dict with email, name, etc.
        """
        try:
            # Exchange code for access token
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    OAuthService.MICROSOFT_TOKEN_URL,
                    data={
                        "code": code,
                        "client_id": settings.MICROSOFT_CLIENT_ID,
                        "client_secret": settings.MICROSOFT_CLIENT_SECRET,
                        "redirect_uri": redirect_uri,
                        "grant_type": "authorization_code",
                    }
                )
                
                if token_response.status_code != 200:
                    logger.error(f"Microsoft token exchange failed: {token_response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to authenticate with Microsoft"
                    )
                
                token_data = token_response.json()
                access_token = token_data.get("access_token")
                
                # Get user information
                user_response = await client.get(
                    OAuthService.MICROSOFT_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if user_response.status_code != 200:
                    logger.error(f"Microsoft userinfo failed: {user_response.text}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to get user information from Microsoft"
                    )
                
                user_data = user_response.json()
                
                # Parse name
                display_name = user_data.get("displayName", "")
                name_parts = display_name.split(" ", 1)
                first_name = name_parts[0] if len(name_parts) > 0 else ""
                last_name = name_parts[1] if len(name_parts) > 1 else ""
                
                return {
                    "email": user_data.get("mail") or user_data.get("userPrincipalName"),
                    "email_verified": True,  # Microsoft accounts are pre-verified
                    "first_name": first_name,
                    "last_name": last_name,
                    "picture": None,  # Would need separate Graph API call
                    "microsoft_id": user_data.get("id"),
                }
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during Microsoft OAuth: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OAuth authentication failed"
            )
