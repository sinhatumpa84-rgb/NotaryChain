"""
Redis connection compatibility shim.

Re-exports unified Redis functionality from app.core.redis to avoid
duplicate Redis connections across the codebase.
"""

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

def ping_redis() -> bool:
    """Check Redis health."""
    return check_redis_connection()

def get_redis():
    """Return unified Redis client instance."""
    return redis_client
