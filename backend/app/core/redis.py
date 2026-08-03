"""
Single Enterprise-Grade Redis Client for NotaryChain Backend.

Uses Redis Cloud via environment variable REDIS_URL.
Never hardcodes credentials or hostnames.
Catches Redis exceptions gracefully without crashing FastAPI.
"""

import json
import logging
import os
from typing import Any, Optional, Union

import redis
from redis import Redis
from redis.exceptions import ConnectionError, RedisError, TimeoutError

logger = logging.getLogger(__name__)

# Default timeouts and TTL settings
DEFAULT_OTP_TTL = 300  # 5 minutes
DEFAULT_SESSION_TTL = 86400  # 24 hours
DEFAULT_CACHE_TTL = 600  # 10 minutes


def _create_redis_client() -> Optional[Redis]:
    """Initialize Redis client using REDIS_URL from environment."""
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        logger.warning("⚠ REDIS_URL environment variable is not set")
        return None

    try:
        kwargs = {
            "decode_responses": True,
            "socket_connect_timeout": 5,
            "socket_timeout": 5,
            "retry_on_timeout": True,
            "health_check_interval": 30,
        }
        if redis_url.startswith("rediss://"):
            kwargs["ssl_cert_reqs"] = None

        return Redis.from_url(redis_url, **kwargs)
    except Exception as exc:
        logger.warning("⚠ Failed to create Redis client instance: %s", exc)
        return None


# Global single Redis client instance
redis_client: Optional[Redis] = _create_redis_client()


def check_redis_connection() -> bool:
    """
    Ping Redis on FastAPI startup or health checks.

    Logs:
        ✓ Redis Connected (if ping succeeds)
        ⚠ Redis unavailable (if ping fails)

    Never raises an exception or crashes the application.
    """
    global redis_client
    if redis_client is None:
        redis_client = _create_redis_client()

    if redis_client is None:
        logger.warning("⚠ Redis unavailable (No client)")
        return False

    try:
        if redis_client.ping():
            logger.info("✓ Redis Connected")
            return True
        else:
            logger.warning("⚠ Redis unavailable")
            return False
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("⚠ Redis unavailable: %s", exc)
        return False
    except Exception as exc:
        logger.warning("⚠ Redis health check failed: %s", exc)
        return False


# ============================================================================
# OTP MANAGEMENT (otp:{email}) — TTL: 300s
# ============================================================================

def save_otp(email: str, otp: str, ttl: int = DEFAULT_OTP_TTL) -> bool:
    """
    Save OTP for an email address with expiration (default 300 seconds).

    Key format: otp:{email}
    """
    if not email:
        return False
    key = f"otp:{email.lower().strip()}"
    try:
        if redis_client is None:
            return False
        redis_client.setex(key, ttl, otp)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis save_otp failed for %s: %s", email, exc)
        return False


def get_otp(email: str) -> Optional[str]:
    """
    Retrieve stored OTP for an email address. Returns None if missing or unavailable.
    """
    if not email:
        return None
    key = f"otp:{email.lower().strip()}"
    try:
        if redis_client is None:
            return None
        return redis_client.get(key)
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis get_otp failed for %s: %s", email, exc)
        return None


def delete_otp(email: str) -> bool:
    """Delete OTP key for an email address after successful verification."""
    if not email:
        return False
    key = f"otp:{email.lower().strip()}"
    try:
        if redis_client is None:
            return False
        redis_client.delete(key)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis delete_otp failed for %s: %s", email, exc)
        return False


# ============================================================================
# SESSION MANAGEMENT (session:{user_id}) — TTL: 24h
# ============================================================================

def save_session(user_id: str, data: Union[dict, str], ttl: int = DEFAULT_SESSION_TTL) -> bool:
    """
    Store user session metadata in Redis with expiration (default 24 hours).

    Key format: session:{user_id}
    """
    if not user_id:
        return False
    key = f"session:{user_id}"
    try:
        if redis_client is None:
            return False
        value_str = json.dumps(data) if isinstance(data, (dict, list)) else str(data)
        redis_client.setex(key, ttl, value_str)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis save_session failed for user %s: %s", user_id, exc)
        return False


def get_session(user_id: str) -> Optional[Union[dict, str]]:
    """Retrieve stored session data for a user_id."""
    if not user_id:
        return None
    key = f"session:{user_id}"
    try:
        if redis_client is None:
            return None
        val = redis_client.get(key)
        if val:
            try:
                return json.loads(val)
            except (json.JSONDecodeError, TypeError):
                return val
        return None
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis get_session failed for user %s: %s", user_id, exc)
        return None


def delete_session(user_id: str) -> bool:
    """Delete session for a user_id."""
    if not user_id:
        return False
    key = f"session:{user_id}"
    try:
        if redis_client is None:
            return False
        redis_client.delete(key)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis delete_session failed for user %s: %s", user_id, exc)
        return False


# ============================================================================
# DATA CACHING (cache:{key}) — TTL: 10m
# ============================================================================

def set_cache(key: str, value: Any, ttl: int = DEFAULT_CACHE_TTL) -> bool:
    """
    Cache frequently accessed data with expiration (default 10 minutes).
    """
    if not key:
        return False
    cache_key = f"cache:{key}" if not key.startswith("cache:") else key
    try:
        if redis_client is None:
            return False
        value_str = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
        redis_client.setex(cache_key, ttl, value_str)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis set_cache failed for key %s: %s", key, exc)
        return False


def get_cache(key: str) -> Optional[Any]:
    """Retrieve cached data by key."""
    if not key:
        return None
    cache_key = f"cache:{key}" if not key.startswith("cache:") else key
    try:
        if redis_client is None:
            return None
        val = redis_client.get(cache_key)
        if val:
            try:
                return json.loads(val)
            except (json.JSONDecodeError, TypeError):
                return val
        return None
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis get_cache failed for key %s: %s", key, exc)
        return None


def delete_cache(key: str) -> bool:
    """Delete cached key."""
    if not key:
        return False
    cache_key = f"cache:{key}" if not key.startswith("cache:") else key
    try:
        if redis_client is None:
            return False
        redis_client.delete(cache_key)
        return True
    except (ConnectionError, TimeoutError, RedisError) as exc:
        logger.warning("Redis delete_cache failed for key %s: %s", key, exc)
        return False
