from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.core.database import get_session
from app.core.redis import get_redis
from app.core.dependencies import get_current_user
from app.schemas.auth import (
    SendOTPRequest, SendOTPResponse,
    VerifyOTPRequest, VerifyOTPResponse,
    RefreshTokenRequest, RefreshTokenResponse,
)
from app.services.auth_service import AuthService
from app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(
    body: SendOTPRequest,
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis),
):
    service = AuthService(UserRepository(session), redis)
    try:
        result = await service.send_otp(body.phone)
        return SendOTPResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=429, detail=str(e))


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(
    body: VerifyOTPRequest,
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis),
):
    service = AuthService(UserRepository(session), redis)
    try:
        result = await service.verify_otp(
            phone=body.phone,
            otp=body.otp,
            otp_ref=body.otp_ref,
            device_id=body.device_id,
            device_name=body.device_name,
        )
        return VerifyOTPResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    body: RefreshTokenRequest,
    session: AsyncSession = Depends(get_session),
    redis: aioredis.Redis = Depends(get_redis),
):
    service = AuthService(UserRepository(session), redis)
    try:
        result = await service.refresh_tokens(body.refresh_token)
        return RefreshTokenResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
