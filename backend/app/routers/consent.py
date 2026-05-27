from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.schemas.consent import (
    ApproveConsentRequest, ApproveConsentResponse,
    RejectConsentRequest, RejectConsentResponse,
    ConsentDetails,
)
from app.services.consent_service import ConsentService
from app.repositories.consent_repo import ConsentRepository
from app.repositories.session_repo import SessionRepository
from app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/api/v1/consent", tags=["consent"])


@router.get("/details", response_model=ConsentDetails)
async def get_consent_details(
    session_id: str,
    merchant_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    session_repo = SessionRepository(db)
    from uuid import UUID
    merchant = await session_repo.get_merchant_by_id(UUID(merchant_id))
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    return ConsentDetails(
        session_id=session_id,
        merchant_name=merchant.merchant_name,
        transaction_amount="$4.50",
        requested_data="Tokenized Identity Only - No Personal Data Shared",
    )


@router.post("/approve", response_model=ApproveConsentResponse)
async def approve_consent(
    body: ApproveConsentRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = ConsentService(
        ConsentRepository(db),
        SessionRepository(db),
    )
    try:
        result = await service.approve(
            user_id=user["sub"],
            session_id=body.session_id,
            merchant_id=body.merchant_id,
        )
        return ApproveConsentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reject", response_model=RejectConsentResponse)
async def reject_consent(
    body: RejectConsentRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    service = ConsentService(
        ConsentRepository(db),
        SessionRepository(db),
    )
    try:
        result = await service.reject(
            user_id=user["sub"],
            session_id=body.session_id,
            merchant_id=body.merchant_id,
            reason=body.reason,
        )
        return RejectConsentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
