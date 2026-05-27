from app.core.security import verify_qr_signature


class QRService:

    def parse_and_validate(self, raw_data: str) -> dict | None:
        try:
            import json
            payload = json.loads(raw_data)
        except (json.JSONDecodeError, TypeError):
            return None

        signed_token = payload.get("signed_token")
        if not signed_token:
            return None

        verified = verify_qr_signature(signed_token)
        if not verified:
            return None

        return verified

    def extract_session_data(self, verified_payload: dict) -> dict:
        return {
            "session_id": verified_payload.get("session_id"),
            "merchant_id": verified_payload.get("merchant_id"),
            "pos_id": verified_payload.get("pos_id"),
            "expires_at": verified_payload.get("expires_at"),
            "nonce": verified_payload.get("nonce"),
        }
