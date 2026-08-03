"""
Redis service wrapper for caching and session management.

Delegates directly to single enterprise-grade Redis core module (app.core.redis).
"""
import logging
from typing import Optional, Any
from app.core.redis import (
    redis_client,
    check_redis_connection,
    save_otp,
    get_otp,
    delete_otp,
    save_session,
    get_session,
    delete_session,
    set_cache,
    get_cache,
    delete_cache,
)

logger = logging.getLogger(__name__)


class RedisService:
    """Redis service delegating to unified app.core.redis module"""

    def __init__(self):
        self.redis_client = redis_client

    async def connect(self) -> bool:
        """Startup connection check - returns True if connected, False otherwise"""
        return check_redis_connection()

    async def disconnect(self):
        """Disconnect helper (noop, handled by connection pool)"""
        pass

    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set key in cache with optional TTL"""
        ttl = expire if expire is not None else 600
        return set_cache(key, value, ttl=ttl)

    async def get(self, key: str) -> Optional[Any]:
        """Get key from cache"""
        return get_cache(key)

    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        return delete_cache(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        val = get_cache(key)
        return val is not None

    async def expire(self, key: str, seconds: int) -> bool:
        """Re-set expiration on a key"""
        val = get_cache(key)
        if val is not None:
            return set_cache(key, val, ttl=seconds)
        return False

    async def incr(self, key: str) -> int:
        """Increment counter safely"""
        try:
            if redis_client is None:
                return 0
            return int(redis_client.incr(key))
        except Exception as exc:
            logger.warning("Redis incr failed for %s: %s", key, exc)
            return 0

    async def decr(self, key: str) -> int:
        """Decrement counter safely"""
        try:
            if redis_client is None:
                return 0
            return int(redis_client.decr(key))
        except Exception as exc:
            logger.warning("Redis decr failed for %s: %s", key, exc)
            return 0


# Global Redis service instance
redis_service = RedisService()
