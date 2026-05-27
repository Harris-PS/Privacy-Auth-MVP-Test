import random
import string
from datetime import datetime, timezone

import redis.asyncio as aioredis

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.repositories.user_repo import UserRepository

settings = get_settings()


class AuthService:
    def __init__(self, user_repo: UserRepository, redis: aioredis.Redis):
        self.user_repo = user_repo
        self.redis = redis

    def _generate_otp(self) -> str:
        return "".join(random.choices(string.digits, k=settings.otp_length))

    async def send_otp(self, phone: str) -> dict:
        rate_key = f"otp_rate:{phone}"
        count = await self.redis.get(rate_key)
        if count and int(count) >= settings.otp_rate_limit_max:
            raise ValueError("Rate limit exceeded. Try again later.")

        otp = self._generate_otp()
        otp_ref = f"otp:{phone}:{datetime.utcnow().timestamp()}"
        pipe = self.redis.pipeline()
        await pipe.setex(f"otp_code:{otp_ref}", settings.otp_expire_seconds, otp)
        await pipe.incr(rate_key)
        await pipe.expire(rate_key, settings.otp_rate_limit_window)
        await pipe.execute()

        print(f"[DEV] OTP for {phone}: {otp}")
        return {"message": "OTP sent successfully", "otp_ref": otp_ref}

    async def verify_otp(self, phone: str, otp: str, otp_ref: str, device_id: str, device_name: str | None = None) -> dict:
        stored = await self.redis.get(f"otp_code:{otp_ref}")
        if not stored or stored.decode() != otp:
            raise ValueError("Invalid or expired OTP")

        await self.redis.delete(f"otp_code:{otp_ref}")

        user = await self.user_repo.get_by_phone(phone)
        is_new = user is None
        if is_new:
            user = await self.user_repo.create(phone=phone, name=None)

        await self.user_repo.upsert_device(user.id, device_id, device_name)

        access_token = create_access_token(user.id, device_id)
        refresh_token = create_refresh_token(user.id, device_id)

        await self._store_refresh_token(user.id, device_id, refresh_token)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": str(user.id),
            "is_new_user": is_new,
        }

    async def refresh_tokens(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        user_id = payload["sub"]
        device_id = payload.get("device_id")

        stored = await self.redis.get(f"refresh:{user_id}:{device_id}")
        if not stored or stored.decode() != refresh_token:
            raise ValueError("Refresh token revoked or expired")

        new_access = create_access_token(user_id, device_id)
        new_refresh = create_refresh_token(user_id, device_id)

        await self._store_refresh_token(user_id, device_id, new_refresh)

        return {"access_token": new_access, "refresh_token": new_refresh}

    async def _store_refresh_token(self, user_id, device_id, token):
        days = settings.refresh_token_expire_days
        await self.redis.setex(f"refresh:{user_id}:{device_id}", days * 86400, token)

    async def revoke_refresh_token(self, user_id, device_id):
        await self.redis.delete(f"refresh:{user_id}:{device_id}")
