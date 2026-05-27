from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    merchant_name = Column(String(255), nullable=False)
    api_key = Column(String(255), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    pos_devices = relationship("POSDevice", back_populates="merchant", cascade="all, delete-orphan")
    sessions = relationship("POSSession", back_populates="merchant", cascade="all, delete-orphan")
    user_links = relationship("MerchantUserLink", back_populates="merchant", cascade="all, delete-orphan")


class POSDevice(Base):
    __tablename__ = "pos_devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    merchant_id = Column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    pos_identifier = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    merchant = relationship("Merchant", back_populates="pos_devices")
