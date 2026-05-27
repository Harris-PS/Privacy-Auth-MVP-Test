from datetime import datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.consent import ConsentLog, MerchantUserLink


class ConsentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_link(self, user_id: UUID, merchant_id: UUID) -> MerchantUserLink:
        link = MerchantUserLink(user_id=user_id, merchant_id=merchant_id)
        self.session.add(link)
        await self.session.flush()
        return link

    async def log_approval(self, session_id: UUID, user_id: UUID) -> ConsentLog:
        log = ConsentLog(
            session_id=session_id,
            user_id=user_id,
            approved=True,
            approved_at=datetime.utcnow(),
        )
        self.session.add(log)
        await self.session.flush()
        return log

    async def log_rejection(self, session_id: UUID, user_id: UUID, reason: str | None = None) -> ConsentLog:
        log = ConsentLog(
            session_id=session_id,
            user_id=user_id,
            approved=False,
            rejected_reason=reason,
        )
        self.session.add(log)
        await self.session.flush()
        return log
