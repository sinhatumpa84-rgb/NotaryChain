"""
Firebase Authentication middleware for FastAPI.

Every protected endpoint uses `get_current_firebase_user` as a dependency.
The frontend must send: Authorization: Bearer <Firebase ID Token>

Never trust the client's claimed identity — always verify the token server-side.
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import firebase_admin.auth as firebase_auth

from app.core.firebase import verify_firebase_token

logger = logging.getLogger(__name__)

# Reusable HTTP Bearer scheme — extracts the Bearer token from the header
_bearer_scheme = HTTPBearer(auto_error=False)


class FirebaseUser:
    """
    Lightweight representation of a verified Firebase token's claims.

    Attributes:
        uid: Firebase user UID.
        email: User's email address.
        email_verified: Whether the email has been verified.
        role: Custom claim role, e.g. 'admin', 'notary', 'company'.
        claims: Full decoded token claims dict.
    """

    def __init__(self, claims: dict) -> None:
        self.uid: str = claims["uid"]
        self.email: Optional[str] = claims.get("email")
        self.email_verified: bool = claims.get("email_verified", False)
        self.role: Optional[str] = claims.get("role")
        self.claims: dict = claims

    def __repr__(self) -> str:  # pragma: no cover
        return f"<FirebaseUser uid={self.uid} email={self.email} role={self.role}>"


async def get_current_firebase_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> FirebaseUser:
    """
    FastAPI dependency: verify Firebase ID token and return the decoded user.

    Usage::

        @router.get("/protected")
        async def protected(user: FirebaseUser = Depends(get_current_firebase_user)):
            return {"uid": user.uid}

    Raises:
        HTTPException 401: If no token is provided or the token is invalid/expired.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        claims = verify_firebase_token(token)
        return FirebaseUser(claims)
    except firebase_auth.RevokedIdTokenError:
        logger.warning("Revoked token presented")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Expired token presented")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_auth.InvalidIdTokenError as exc:
        logger.warning("Invalid token: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        logger.error("Unexpected token verification error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(*allowed_roles: str):
    """
    Dependency factory: restrict access to users with specific roles.

    Roles are read from the Firebase custom claim ``role``.

    Usage::

        @router.get("/admin")
        async def admin_only(
            user: FirebaseUser = Depends(require_role("admin", "super_admin"))
        ):
            ...

    Args:
        *allowed_roles: One or more role strings that are permitted.

    Returns:
        A FastAPI dependency that returns the verified FirebaseUser if authorised.

    Raises:
        HTTPException 403: If the user's role is not in ``allowed_roles``.
    """

    async def _check_role(
        user: FirebaseUser = Depends(get_current_firebase_user),
    ) -> FirebaseUser:
        if user.role not in allowed_roles:
            logger.warning(
                "Access denied: uid=%s role=%s required=%s",
                user.uid,
                user.role,
                allowed_roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {' or '.join(allowed_roles)}",
            )
        return user

    return _check_role


def require_verified_email():
    """
    Dependency: ensure the user's email address has been verified in Firebase.

    Raises:
        HTTPException 403: If email is not verified.
    """

    async def _check_verified(
        user: FirebaseUser = Depends(get_current_firebase_user),
    ) -> FirebaseUser:
        if not user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email address not verified. Please verify your email first.",
            )
        return user

    return _check_verified
