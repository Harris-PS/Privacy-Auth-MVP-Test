from pydantic import BaseModel, Field


class ConsentDetails(BaseModel):
    session_id: str
    merchant_name: str
    transaction_amount: str | None = None
    requested_data: str = "Tokenized Identity Only"


class ApproveConsentRequest(BaseModel):
    session_id: str
    merchant_id: str


class ApproveConsentResponse(BaseModel):
    status: str
    approval_token: str
    message: str


class RejectConsentRequest(BaseModel):
    session_id: str
    merchant_id: str
    reason: str | None = None


class RejectConsentResponse(BaseModel):
    status: str
    message: str
