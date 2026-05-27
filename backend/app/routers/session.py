from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.schemas.session import (
    CreateSessionRequest, CreateSessionResponse,
    ValidateSessionRequest, ValidateSessionResponse,
)
from app.services.session_service import SessionService
from app.repositories.session_repo import SessionRepository

router = APIRouter(prefix="/api/v1/session", tags=["session"])


@router.post("/create", response_model=CreateSessionResponse)
async def create_session(body: CreateSessionRequest, db: AsyncSession = Depends(get_session)):
    service = SessionService(SessionRepository(db))
    try:
        result = await service.create_session(
            merchant_id=body.merchant_id,
            pos_id=body.pos_id,
            api_key=body.api_key,
        )
        return CreateSessionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate", response_model=dict)
async def validate_session(
    body: ValidateSessionRequest,
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_session),
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    service = SessionService(SessionRepository(db))
    result = await service.validate_session(
        session_token=body.session_token,
        signed_token=body.signed_token,
    )

    if not result.get("valid"):
        return {
            "valid": False,
            "onboarding_required": False,
            "error": result.get("error", "invalid_session"),
        }

    if token:
        from app.core.security import decode_token
        payload = decode_token(token)
        if payload:
            user_id = payload.get("sub")
            is_existing = await service.check_existing_user(
                user_id, result["merchant_id"]
            )
            result["onboarding_required"] = not is_existing
            return result

    return {
        **result,
        "onboarding_required": True,
    }
