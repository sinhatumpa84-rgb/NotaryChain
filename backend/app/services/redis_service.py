"""
Redis service for caching and session management
"""
import redis.asyncio as redis
from typing import Optional, Any
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisService:
    """Redis service for caching and session management"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
    
    async def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Set a value in Redis"""
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            
            if expire:
                await self.redis_client.setex(key, expire, value)
            else:
                await self.redis_client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error: {str(e)}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get a value from Redis"""
        try:
            value = await self.redis_client.get(key)
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logger.error(f"Redis GET error: {str(e)}")
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete a key from Redis"""
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error: {str(e)}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis"""
        try:
            return await self.redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS error: {str(e)}")
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration time for a key"""
        try:
            await self.redis_client.expire(key, seconds)
            return True
        except Exception as e:
            logger.error(f"Redis EXPIRE error: {str(e)}")
            return False
    
    async def incr(self, key: str) -> int:
        """Increment a counter"""
        try:
            return await self.redis_client.incr(key)
        except Exception as e:
            logger.error(f"Redis INCR error: {str(e)}")
            return 0
    
    async def decr(self, key: str) -> int:
        """Decrement a counter"""
        try:
            return await self.redis_client.decr(key)
        except Exception as e:
            logger.error(f"Redis DECR error: {str(e)}")
            return 0
    
    async def hset(self, name: str, key: str, value: Any) -> bool:
        """Set hash field"""
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value)
            await self.redis_client.hset(name, key, value)
            return True
        except Exception as e:
            logger.error(f"Redis HSET error: {str(e)}")
            return False
    
    async def hget(self, name: str, key: str) -> Optional[Any]:
        """Get hash field"""
        try:
            value = await self.redis_client.hget(name, key)
            if value:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logger.error(f"Redis HGET error: {str(e)}")
            return None
    
    async def hgetall(self, name: str) -> dict:
        """Get all hash fields"""
        try:
            return await self.redis_client.hgetall(name)
        except Exception as e:
            logger.error(f"Redis HGETALL error: {str(e)}")
            return {}
    
    async def hdel(self, name: str, *keys: str) -> bool:
        """Delete hash fields"""
        try:
            await self.redis_client.hdel(name, *keys)
            return True
        except Exception as e:
            logger.error(f"Redis HDEL error: {str(e)}")
            return False


# Global Redis service instance
redis_service = RedisService()
