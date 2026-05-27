from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class POSSession(Base):
    __tablename__ = "pos_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    pos_id = Column(UUID(as_uuid=True), ForeignKey("pos_devices.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    nonce = Column(String(64), unique=True, nullable=False)
    status = Column(String(20), default="active", nullable=False)
    signed_token = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    merchant = relationship("Merchant", back_populates="sessions")
