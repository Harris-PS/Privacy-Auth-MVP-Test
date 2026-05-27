import hashlib
import secrets
from datetime import datetime, timezone, timedelta

import redis.asyncio as aioredis


class NonceManager:
    def __init__(self, redis: aioredis.Redis):
        self.redis = redis

    async def generate_and_store(self, ttl_seconds: int = 300) -> str:
        nonce = hashlib.sha256(secrets.token_bytes(32)).hexdigest()
        await self.redis.setex(f"nonce:{nonce}", ttl_seconds, "valid")
        return nonce

    async def consume(self, nonce: str) -> bool:
        key = f"nonce:{nonce}"
        exists = await self.redis.get(key)
        if not exists:
            return False
        await self.redis.delete(key)
        return True
