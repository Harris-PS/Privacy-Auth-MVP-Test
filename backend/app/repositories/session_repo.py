from datetime import datetime
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.merchant import Merchant, POSDevice
from app.models.session import POSSession
from app.models.consent import MerchantUserLink


class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_merchant_by_id(self, merchant_id: UUID) -> Merchant | None:
        result = await self.session.execute(select(Merchant).where(Merchant.id == merchant_id))
        return result.scalar_one_or_none()

    async def get_pos_device(self, pos_id: UUID) -> POSDevice | None:
        result = await self.session.execute(select(POSDevice).where(POSDevice.id == pos_id))
        return result.scalar_one_or_none()

    async def create_session(self, merchant_id: UUID, pos_id: UUID, expires_at: datetime, nonce: str, signed_token: str) -> POSSession:
        session = POSSession(
            merchant_id=merchant_id,
            pos_id=pos_id,
            expires_at=expires_at,
            nonce=nonce,
            signed_token=signed_token,
        )
        self.session.add(session)
        await self.session.flush()
        return session

    async def get_session(self, session_id: UUID) -> POSSession | None:
        result = await self.session.execute(
            select(POSSession).where(POSSession.session_id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_merchant_user_link(self, user_id: UUID, merchant_id: UUID) -> MerchantUserLink | None:
        result = await self.session.execute(
            select(MerchantUserLink).where(
                and_(
                    MerchantUserLink.user_id == user_id,
                    MerchantUserLink.merchant_id == merchant_id,
                    MerchantUserLink.status == "active",
                )
            )
        )
        return result.scalar_one_or_none()

    async def update_session_status(self, session_id: UUID, status: str):
        session = await self.get_session(session_id)
        if session:
            session.status = status
            await self.session.flush()
