"""
Firebase Admin SDK initialization for NotaryChain backend.

Reads credentials exclusively from environment variables.
Never hardcode Firebase credentials.
"""

import logging
import json
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from app.core.config import settings

logger = logging.getLogger(__name__)

_firebase_app: firebase_admin.App | None = None


def _get_firebase_app() -> firebase_admin.App:
    """
    Lazily initialize and return the Firebase Admin SDK app.

    Uses env vars:
        FIREBASE_PROJECT_ID      — GCP project ID
        FIREBASE_CLIENT_EMAIL    — service account email
        FIREBASE_PRIVATE_KEY     — service account private key (PEM)

    Falls back to Application Default Credentials when running on GCP.
    """
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    # Already initialized by a previous call (e.g., in tests)
    if firebase_admin._apps:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app

    project_id = settings.FIREBASE_PROJECT_ID
    client_email = getattr(settings, "FIREBASE_CLIENT_EMAIL", None)
    private_key = getattr(settings, "FIREBASE_PRIVATE_KEY", None)

    if client_email and private_key:
        # Build credential from explicit service account fields
        # The private key stored in .env may have literal \n — replace them
        private_key = private_key.replace("\\n", "\n")

        cert_dict = {
            "type": "service_account",
            "project_id": project_id,
            "private_key_id": "env_provided",
            "private_key": private_key,
            "client_email": client_email,
            "client_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        cred = credentials.Certificate(cert_dict)
        logger.info("Firebase Admin SDK: using service account credentials from env")
    else:
        # Fallback: Application Default Credentials (works on GCP/Cloud Run)
        cred = credentials.ApplicationDefault()
        logger.info("Firebase Admin SDK: using Application Default Credentials")

    _firebase_app = firebase_admin.initialize_app(cred, {"projectId": project_id})
    logger.info("Firebase Admin SDK initialized for project: %s", project_id)
    return _firebase_app


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return its decoded claims.

    Args:
        id_token: The raw Firebase ID token string from the Authorization header.

    Returns:
        dict: Decoded token claims, including ``uid``, ``email``, ``email_verified``,
              and any custom claims set via Admin SDK.

    Raises:
        firebase_admin.auth.InvalidIdTokenError: Token is malformed or expired.
        firebase_admin.auth.RevokedIdTokenError: Token has been revoked.
        ValueError: id_token is empty.
    """
    _get_firebase_app()
    decoded = firebase_auth.verify_id_token(id_token, check_revoked=True)
    return decoded


def get_firebase_user(uid: str) -> firebase_auth.UserRecord:
    """
    Fetch a Firebase user record by UID.

    Args:
        uid: Firebase user UID.

    Returns:
        firebase_admin.auth.UserRecord
    """
    _get_firebase_app()
    return firebase_auth.get_user(uid)


def set_custom_claims(uid: str, claims: dict) -> None:
    """
    Set custom claims on a Firebase user (used for RBAC roles).

    Args:
        uid: Firebase user UID.
        claims: Dictionary of custom claims, e.g. ``{"role": "admin"}``.
    """
    _get_firebase_app()
    firebase_auth.set_custom_user_claims(uid, claims)
    logger.info("Custom claims set for uid=%s: %s", uid, claims)


def revoke_refresh_tokens(uid: str) -> None:
    """
    Revoke all refresh tokens for a user (force logout everywhere).

    Args:
        uid: Firebase user UID.
    """
    _get_firebase_app()
    firebase_auth.revoke_refresh_tokens(uid)
    logger.info("Refresh tokens revoked for uid=%s", uid)
