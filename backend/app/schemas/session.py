from datetime import datetime
from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    merchant_id: str
    pos_id: str
    api_key: str


class CreateSessionResponse(BaseModel):
    session_id: str
    qr_payload: dict


class QRPayload(BaseModel):
    session_id: str
    merchant_id: str
    pos_id: str
    expires_at: datetime
    nonce: str
    signed_token: str


class ValidateSessionRequest(BaseModel):
    session_token: str
    signed_token: str


class ValidateSessionResponse(BaseModel):
    valid: bool
    onboarding_required: bool
    session_id: str | None = None
    merchant_name: str | None = None
    merchant_id: str | None = None


class SessionError(BaseModel):
    code: str
    message: str
