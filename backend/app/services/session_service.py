import hashlib
import secrets
from datetime import datetime, timezone, timedelta

from app.core.config import get_settings
from app.core.security import sign_qr_payload, verify_qr_signature
from app.repositories.session_repo import SessionRepository

settings = get_settings()


class SessionService:
    def __init__(self, session_repo: SessionRepository):
        self.session_repo = session_repo

    def _generate_nonce(self) -> str:
        return hashlib.sha256(secrets.token_bytes(32)).hexdigest()

    async def create_session(self, merchant_id: str, pos_id: str, api_key: str) -> dict:
        from uuid import UUID
        mid = UUID(merchant_id)
        pid = UUID(pos_id)

        merchant = await self.session_repo.get_merchant_by_id(mid)
        if not merchant:
            raise ValueError("Merchant not found")
        if merchant.api_key != api_key:
            raise ValueError("Invalid API key")
        if merchant.status != "active":
            raise ValueError("Merchant account is inactive")

        pos = await self.session_repo.get_pos_device(pid)
        if not pos:
            raise ValueError("POS device not found")

        expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.qr_expire_seconds)
        nonce = self._generate_nonce()

        qr_data = {
            "session_id": str(merchant_id),
            "merchant_id": str(merchant_id),
            "pos_id": str(pos_id),
            "expires_at": expires_at.isoformat(),
            "nonce": nonce,
        }
        signed_token = sign_qr_payload(qr_data)

        session = await self.session_repo.create_session(
            merchant_id=mid,
            pos_id=pid,
            expires_at=expires_at,
            nonce=nonce,
            signed_token=signed_token,
        )

        qr_payload = {
            "session_id": str(session.session_id),
            "merchant_id": str(merchant_id),
            "pos_id": str(pos_id),
            "expires_at": expires_at.isoformat(),
            "nonce": nonce,
            "signed_token": signed_token,
        }

        return {"session_id": str(session.session_id), "qr_payload": qr_payload}

    async def validate_session(self, session_token: str, signed_token: str) -> dict:
        payload = verify_qr_signature(signed_token)
        if not payload:
            return {"valid": False, "error": "invalid_signature"}

        from uuid import UUID
        session_id = UUID(payload["session_id"])
        session = await self.session_repo.get_session(session_id)
        if not session:
            return {"valid": False, "error": "session_not_found"}
        if session.status != "active":
            return {"valid": False, "error": f"session_{session.status}"}
        if session.nonce != payload.get("nonce"):
            return {"valid": False, "error": "nonce_mismatch"}
        if datetime.now(timezone.utc) > session.expires_at.replace(tzinfo=timezone.utc):
            await self.session_repo.update_session_status(session_id, "expired")
            return {"valid": False, "error": "session_expired"}

        merchant = await self.session_repo.get_merchant_by_id(session.merchant_id)
        merchant_name = merchant.merchant_name if merchant else "Unknown"

        return {
            "valid": True,
            "session_id": str(session.session_id),
            "merchant_id": str(session.merchant_id),
            "merchant_name": merchant_name,
        }

    async def check_existing_user(self, user_id, merchant_id):
        from uuid import UUID
        link = await self.session_repo.get_merchant_user_link(
            UUID(user_id), UUID(merchant_id)
        )
        return link is not None

    async def mark_session_used(self, session_id):
        from uuid import UUID
        await self.session_repo.update_session_status(UUID(session_id), "completed")
