try:
    import redis.asyncio as aioredis
except ImportError:  # pragma: no cover
    aioredis = None

from app.core.config import get_settings

settings = get_settings()
_redis = None


async def get_redis():
    global _redis
    if aioredis is None:
        raise RuntimeError("redis package is not installed or does not support asyncio")
    if _redis is None:
        _redis = aioredis.from_url(
            settings.redis_url,
            decode_responses=False,
            max_connections=20,
        )
    return _redis


async def close_redis():
    global _redis
    if _redis:
        await _redis.close()
        _redis = None
