from pydantic import BaseModel, Field


class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)


class SendOTPResponse(BaseModel):
    message: str
    otp_ref: str


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)
    otp: str = Field(..., min_length=4, max_length=8)
    otp_ref: str
    device_id: str
    device_name: str | None = None


class VerifyOTPResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    is_new_user: bool


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class RegisterDeviceRequest(BaseModel):
    device_id: str
    device_name: str | None = None


class RegisterDeviceResponse(BaseModel):
    message: str


class TokenData(BaseModel):
    user_id: str
    device_id: str | None = None
    token_type: str
