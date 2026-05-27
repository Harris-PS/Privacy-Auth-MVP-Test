from uuid import UUID

from app.repositories.consent_repo import ConsentRepository
from app.repositories.session_repo import SessionRepository
from app.core.security import sign_qr_payload


class ConsentService:
    def __init__(self, consent_repo: ConsentRepository, session_repo: SessionRepository):
        self.consent_repo = consent_repo
        self.session_repo = session_repo

    async def approve(self, user_id: str, session_id: str, merchant_id: str) -> dict:
        session = await self.session_repo.get_session(UUID(session_id))
        if not session or session.status != "active":
            raise ValueError("Session is not active or not found")

        link = await self.session_repo.get_merchant_user_link(UUID(user_id), UUID(merchant_id))
        if not link:
            await self.consent_repo.create_link(UUID(user_id), UUID(merchant_id))

        await self.consent_repo.log_approval(UUID(session_id), UUID(user_id))
        await self.session_repo.update_session_status(UUID(session_id), "completed")

        approval_token = sign_qr_payload({
            "type": "consent_approval",
            "session_id": session_id,
            "user_id": user_id,
            "merchant_id": merchant_id,
        })

        return {
            "status": "approved",
            "approval_token": approval_token,
            "message": "Identity Tokenized & Consent Submitted to Backend",
        }

    async def reject(self, user_id: str, session_id: str, merchant_id: str, reason: str | None = None) -> dict:
        session = await self.session_repo.get_session(UUID(session_id))
        if not session or session.status != "active":
            raise ValueError("Session is not active or not found")

        await self.consent_repo.log_rejection(UUID(session_id), UUID(user_id), reason)
        await self.session_repo.update_session_status(UUID(session_id), "cancelled")

        return {
            "status": "rejected",
            "message": "Session Cancelled",
        }
